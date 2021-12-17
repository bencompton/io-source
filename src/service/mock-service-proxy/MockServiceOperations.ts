import { IServiceCallOptions, IServiceResponse } from '../ServiceProxy';

export interface IMockServiceOperationResponseFunction<TRequest, TResponse> {
    (urlMatches?: string[], requestBody?: TRequest, options?: IServiceCallOptions, params?: any): IServiceResponse<TResponse>;
}

export interface IMockServiceOperation<TRequest, TResponse> {
    operationType: ServiceOperationTypeEnum;
    urlRegex: RegExp;
    response: IMockServiceOperationResponseFunction<TRequest, TResponse>;
}

export type ServiceOperationTypeEnum =
    'create'
    | 'read'
    | 'patch'
    | 'update'
    | 'delete';

export class MockServiceOperations {
    private serviceOperations: IMockServiceOperation<any, any>[] = [];

    public add<TRequest, TResponse>(operation: IMockServiceOperation<TRequest, TResponse>) {
        this.serviceOperations.push(operation);
    }

    public getMatchingOperations<TData, TReturn>(
        operationType: ServiceOperationTypeEnum,
        resourcePath: string
    ) {
        const operations = this.serviceOperations;
        const matchingOperations: IMockServiceOperation<any, any>[] = [];

        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            const urlMatches = resourcePath.match(operation.urlRegex);

            if (urlMatches && operation.operationType === operationType) {
                matchingOperations.push(operation);
            }
        }

        return matchingOperations;
    }
}