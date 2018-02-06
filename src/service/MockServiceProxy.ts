import {IServiceProxy, IServiceResponse} from './ServiceProxy';
import {ServiceProxyResponseEvent} from './ServiceProxyResponseEvent';
import {ServiceProxyError} from './ServiceProxyError';
import {MockConnectivityMonitor, ConnectionStatusEnum} from './ConnectivityMonitor';

export type ServiceOperationTypeEnum =
    "create"
    | "read"
    | "update"
    | "delete";

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
    private connectivityMonitor: MockConnectivityMonitor;

    public loggedCalls: ILoggedServiceCall[] = [];

    constructor(addRandomDelays: boolean = false) {
        this.addRandomDelays = addRandomDelays;
        this.serviceProxyResponseEvent = new ServiceProxyResponseEvent();
        this.params = {};
    }

    public listenToConnectivityMonitor(connectivityMonitor: MockConnectivityMonitor) {
        this.connectivityMonitor = connectivityMonitor;
    }

    public addOperation(operation: IMockServiceOperation<any, any>) {
        this.serviceOperations.push(operation);
    }

    public createViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.fakeAjaxCall<TData, TReturn>("create", resourcePath, data);
    }

    public readViaService<T>(resourcePath: string): Promise<T> {
        return this.fakeAjaxCall<void, T>("read", resourcePath, null);
    }

    public updateViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.fakeAjaxCall<TData, TReturn>("update", resourcePath, data);
    }

    public deleteViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.fakeAjaxCall<TData, TReturn>("delete", resourcePath, data);
    }

    public addStaticDelay(serviceOperationName: string, delay: number) {
        this.staticDelay[serviceOperationName] = delay;
    }

    public setParams(params: any) {
        this.params = params;
    }

    public setParam(paramName: string, paramValue: any) {
        this.params[paramName] = paramValue;
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
                if (this.connectivityMonitor) {
                    return this.connectivityMonitor.getConnectionStatus();
                } else {
                    return Promise.resolve(null);
                }
            })
            .then(connectivityStatus => {
                if (connectivityStatus && connectivityStatus === "Disconnected") {
                    throw new Error('Could not call service operation because there is no connectivity');
                }

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
                    throw new ServiceProxyError(resourcePath, response.status, <any>response.responseBody);
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