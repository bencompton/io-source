import { MockServiceOperations, IMockServiceOperationResponseFunction } from './MockServiceOperations';
import { IServiceResponse } from '../ServiceProxy';

export interface IServiceResponseFunctionBaseArgs {
    urlParameters?: string;
    requestBody?: any;
    options?: any;
    globalServiceParameters?: any;
}

export interface IServiceResponseFunctionUrlParameter {
    [key: string]: string;
}

export interface IServiceResponseFunction<TResponse> {
    (urlParameters?: any, requestBody?: any, options?: any, globalServiceParameters?: any): TResponse | IServiceResponse<TResponse>
}

export class MockServiceDefinitions {
    private mockServiceOperations: MockServiceOperations;

    constructor(mockServiceOperations: MockServiceOperations) {
        this.mockServiceOperations = mockServiceOperations;
    }

    public addCreateOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.mockServiceOperations.add({
            operationType: 'create',
            urlRegex: this.convertUrlToRegex(url),
            response: this.getResponseFunction<TRequest, TResponse>(url, responseFunction)
        });
    }

    public addReadOperation<TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.mockServiceOperations.add({
            operationType: 'read',
            urlRegex: this.convertUrlToRegex(url),
            response: this.getResponseFunction<void, TResponse>(url, responseFunction)
        });
    }

    public addPatchOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.mockServiceOperations.add({
            operationType: 'patch',
            urlRegex: this.convertUrlToRegex(url),
            response: this.getResponseFunction<TRequest, TResponse>(url, responseFunction)
        });
    }

    public addUpdateOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.mockServiceOperations.add({
            operationType: 'update',
            urlRegex: this.convertUrlToRegex(url),
            response: this.getResponseFunction<TRequest, TResponse>(url, responseFunction)
        });
    }

    public addDeleteOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.mockServiceOperations.add({
            operationType: 'delete',
            urlRegex: this.convertUrlToRegex(url),
            response: this.getResponseFunction<TRequest, TResponse>(url, responseFunction)
        });
    }

    private getResponseFunction<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ): IMockServiceOperationResponseFunction<TRequest, TResponse> {
        return (urlMatches: RegExpMatchArray, requestBody: TRequest, options: any, globalServiceParameters: any): IServiceResponse<TResponse> => {
            if (!responseFunction) {
                return {
                    status: 204,
                    responseBody: null as TResponse
                };
            }

            const response = responseFunction(
                this.getUrlParams(url, urlMatches),
                requestBody,
                options,
                globalServiceParameters
            );

            if (!response) {
                return {
                    status: 204,
                    responseBody: null
                };
            } else if (
                (response as IServiceResponse<TResponse>).responseBody !== undefined
                && (response as IServiceResponse<TResponse>).status
            ) {
                return {
                    status: (response as IServiceResponse<TResponse>).status,
                    responseBody: (response as IServiceResponse<TResponse>).responseBody
                };
            } else {
                return {
                    status: 200,
                    responseBody: response as TResponse
                };
            }
        };
    }

    private getUrlParams(url: string | RegExp, urlMatches: RegExpMatchArray): Object | RegExpMatchArray {
        if (url instanceof RegExp) {
            return urlMatches;
        } else {
            const matches = url.match(/\{([a-zA-Z0-9_-]+)\}/g);
            const urlParams: any = {};

            matches && matches.forEach((value, index) => {
                urlParams[value.replace('{', '').replace('}', '')] = urlMatches[index + 1];
            });

            return urlParams;
        }
    }

    private convertUrlToRegex(url: string | RegExp) {
        if (url instanceof RegExp) {
            return url;
        } else {
            return new RegExp(`^${url.replace(/\//g, '\/').replace(/\{.*\}/g, '([A-Za-z0-9-_]*)')}$`);
        }
    }
}
