import {IServiceProxy} from './ServiceProxy';

export enum ServiceOperationTypeEnum {
    Create,
    Read,
    Update,
    Delete
}

export interface IMockResponseError {
    message: string;
}

export interface IMockResponse<T> {
    status: number;
    responseBody: T | IMockResponseError;
}

export interface ILoggedServiceCall {
    urlMatches: RegExpMatchArray;
    response: IMockResponse<any>;
    requestBody: any;
}

export interface IMockServiceOperation<TRequest, TResponse> {
    name: string;
    operationType: ServiceOperationTypeEnum;
    urlRegex: RegExp;
    response: (urlMatches?: string[], requestBody?: TRequest, params?: any) => IMockResponse<TResponse>;
}

export class MockServiceProxy implements IServiceProxy {
    private addRandomDelays: boolean;
    private serviceOperations: IMockServiceOperation<any, any>[] = [];
    private params: any;
    private staticDelay: { [operationName: string]: number} = {};
    private globalHeaders: { [headerName: string]: string } = {};

    public loggedCalls: ILoggedServiceCall[] = [];

    constructor(addRandomDelays: boolean = false) {
        this.addRandomDelays = addRandomDelays;
    }

    public addGlobalHeader(headerName: string, headerValue: string) {
        this.globalHeaders[headerName] = headerValue;
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

    private fakeAjaxCall<TData, TReturn>(operationType: ServiceOperationTypeEnum, resourcePath: string, data: TData): Promise<TReturn> {
        return Promise.resolve()
            .then(() => {
                const matchingOperations = this.getMatchingOperations<TData, TReturn>(resourcePath);

                if (matchingOperations.length > 1) {
                    throw new Error(`More than 1 matching service operation found for URL "${resourcePath}"`);
                }

                if (matchingOperations.length === 0) {
                    throw new Error(`The URL "${resourcePath}" was not found for operation type "${ServiceOperationTypeEnum[operationType]}"!`);
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
                const urlMatches = resourcePath.match(serviceOperation.urlRegex);
                const response = serviceOperation.response(urlMatches, requestBody, this.params);

                this.loggedCalls.push({
                    urlMatches,
                    response,
                    requestBody
                });

                if (response.status >= 200 && response.status < 400) {
                    return <TReturn>response.responseBody;
                } else {
                    let errorMessage = `The URL "${resourcePath}" returned an error!`;

                    if (response.responseBody) {
                        errorMessage += ` The following info was provided in the response body: "${JSON.stringify(response.responseBody)}"`;
                    }

                    throw new Error(errorMessage);
                }
            });
    }
}