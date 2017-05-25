import {IServiceProxy, IServiceResponse} from './ServiceProxy';
import {ServiceProxyResponseEvent} from './ServiceProxyResponseEvent';

export enum ServiceOperationTypeEnum {
    Create,
    Read,
    Update,
    Delete
}

export interface ILoggedServiceCall {
    urlMatches: RegExpMatchArray;
    response: IServiceResponse<any>;
    requestBody: any;
}

export interface IMockServiceOperation<TRequest, TResponse> {
    name: string;
    operationType: ServiceOperationTypeEnum;
    urlRegex: RegExp;
    response: (urlMatches?: string[], requestBody?: TRequest, params?: any) => IServiceResponse<TResponse>;
}

export class MockServiceProxy implements IServiceProxy {
    private addRandomDelays: boolean;
    private serviceOperations: IMockServiceOperation<any, any>[] = [];
    private params: any;
    private staticDelay: { [operationName: string]: number} = {};    
    private serviceProxyResponseEvent: ServiceProxyResponseEvent;
    private globalResponseHeaders: {[name: string]: string | (() => string)} = {};

    public loggedCalls: ILoggedServiceCall[] = [];

    constructor(addRandomDelays: boolean = false) {
        this.addRandomDelays = addRandomDelays;
        this.serviceProxyResponseEvent = new ServiceProxyResponseEvent();
    }

    public addOperation(operation: IMockServiceOperation<any, any>) {
        this.serviceOperations.push(operation);
    }

    public createViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.fakeAjaxCall<TData, TReturn>(ServiceOperationTypeEnum.Create, resourcePath, data);
    }

    public readViaService<T>(resourcePath: string): Promise<T> {
        return this.fakeAjaxCall<void, T>(ServiceOperationTypeEnum.Read, resourcePath, null);
    }

    public updateViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.fakeAjaxCall<TData, TReturn>(ServiceOperationTypeEnum.Update, resourcePath, data);
    }

    public deleteViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.fakeAjaxCall<TData, TReturn>(ServiceOperationTypeEnum.Delete, resourcePath, data);
    }

    public addStaticDelay(serviceOperationName: string, delay: number) {
        this.staticDelay[serviceOperationName] = delay;
    }

    public setParams(params: any) {
        this.params = params;
    }

    public get responseEvent() {
        return this.serviceProxyResponseEvent;
    }

    public addGlobalResponseHeader(name: string, value: string)
    public addGlobalResponseHeader(name: string, value: () => string)
    public addGlobalResponseHeader(name: string, value: (() => string) | string) {
        this.globalResponseHeaders[name] = value;
    }

    private fakeAjaxCall<TData, TReturn>(operationType: ServiceOperationTypeEnum, resourcePath: string, data: TData): Promise<TReturn> {
        return Promise.resolve()
            .then(() => {
                const matchingOperations = this.getMatchingOperations<TData, TReturn>(resourcePath);

                if (matchingOperations.length > 1) {                    
                    throw new Error(`More than 1 matching service operation found for URL "${resourcePath}"`);
                }

                return this.executeServiceOperation(resourcePath, matchingOperations[0], data);
            });
    }

    private getMatchingOperations<TData, TReturn>(resourcePath: string): IMockServiceOperation<TData, TReturn>[] {
        const operations = this.serviceOperations;
        const matchingOperations: IMockServiceOperation<any, any>[] = [];

        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            const urlMatches = resourcePath.match(operation.urlRegex);

            if (urlMatches) {
                matchingOperations.push(operation);
            }
        }

        return matchingOperations;
    }

    private executeServiceOperation<TData, TReturn>(resourcePath: string, serviceOperation: IMockServiceOperation<TData, TReturn>, requestBody: TData): Promise<TReturn> {
        return new Promise<TReturn>(resolve => {
                let timeout : number;

                if (this.staticDelay[serviceOperation.name]) {
                    timeout = this.staticDelay[serviceOperation.name];
                } else {
                    timeout = this.addRandomDelays ? (Math.random() * 500) : 0;
                }

                setTimeout(() => resolve(), timeout);
            })
            .then(() => {
                let urlMatches: RegExpMatchArray;
                let response: IServiceResponse<TReturn>;

                if (resourcePath) {
                    urlMatches = resourcePath.match(serviceOperation.urlRegex);
                    response = serviceOperation.response(urlMatches, requestBody, this.params);                    
                } else {
                    response = {
                        status: 404,
                        responseBody: <any>`The URL "${resourcePath}" was not found for the specified operation type!`
                    };

                    urlMatches = [];
                }

                this.loggedCalls.push({
                    urlMatches,
                    response,
                    requestBody
                });

                this.addGlobalResponseHeaders(response);
                
                this.responseEvent.fire(response);                

                if (response.status >= 200 && response.status < 400) {
                    return <TReturn>response.responseBody;
                } else {
                    let errorMessage = `The URL "${resourcePath}" returned an error!`;

                    if (response.responseBody) {
                        errorMessage += `The following info was provided in the response body: "${JSON.stringify(response.responseBody)}"`;
                    }

                    throw new Error(errorMessage);
                }
            });
    }

    private addGlobalResponseHeaders(response: IServiceResponse<any>) {
        const processedGlobalResponseHeaders = Object.keys(this.globalResponseHeaders)
            .reduce((previousHeaderName, currentHeaderName) => {
                const value = this.globalResponseHeaders[currentHeaderName];
                let processedValue: string;

                if (typeof value === 'function') {
                    processedValue = value();
                } else {
                    processedValue = value;
                }
                
                return {
                    ...previousHeaderName,
                    [currentHeaderName]: processedValue
                }                
            }, {});            

        response.headers = {
            ...processedGlobalResponseHeaders,
            ...response.headers            
        };
    }
}