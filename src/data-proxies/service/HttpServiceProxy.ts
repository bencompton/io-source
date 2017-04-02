import 'whatwg-fetch';

import {ISerializer} from '../serializers/Serializer';
import {IServiceProxy} from './ServiceProxy';

export class HttpServiceProxy implements IServiceProxy {
    private serializer: ISerializer;
    private globalHeaders: { [headerName: string]: string};
    private baseUrl: string;

    constructor(serializer: ISerializer = JSON, baseUrl: string = '/api') {
        this.serializer = serializer;
        this.globalHeaders = {};
        this.baseUrl = baseUrl;
    }

    public addGlobalHeader(headerName: string, headerValue: string) {
        this.globalHeaders[headerName] = headerValue;
    }

    public createViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse: boolean = true): Promise<TReturn> {
        return this.ajaxRequest<TData, TReturn>('POST', resourcePath, data, deserializeResponse);
    }

    public readViaService<T>(resourcePath: string, deserializeResponse: boolean = true): Promise<T> {
        return this.ajaxRequest<void, T>('GET', resourcePath, null, deserializeResponse);
    }

    public updateViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse: boolean = true): Promise<TReturn> {
        return this.ajaxRequest<TData, TReturn>('PUT', resourcePath, data, deserializeResponse);
    }

    public deleteViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse: boolean = true): Promise<TReturn> {
        return this.ajaxRequest<TData, TReturn>('DELETE', resourcePath, data, deserializeResponse);
    }

    private ajaxRequest<TData, TReturn>(verb: string, resourcePath: string, data?: TData, deserializeResponse: boolean = true): Promise<TReturn> {
        const url = this.baseUrl + resourcePath;

        const config: any = {
            method: verb,
            credentials: 'include',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json'
            }
        };

        config.headers = { ...config.headers, ...this.globalHeaders };

        if (verb !== 'GET') {
            config.body = this.serializer.stringify(data);
        }

        return fetch(url, config)
            .then(response => {
                return <Promise<TReturn>>this.handleResponse(response, deserializeResponse);
            });
    }

    private handleResponse<TReturn>(response: Response, deserializeResponse: boolean): Promise<TReturn> {
        if (response.status >= 200 && response.status < 300) {
            return response.text()
                .then(responseJson => {
                    if (deserializeResponse) {
                        return this.serializer.parse<TReturn>(responseJson);
                    } else {
                        return <TReturn>(<any>responseJson);
                    }
                });
        } else {
            return response.text()
                .then(errorResponseText => {
                    let errorMessage = 'An unexpected error occurred';

                    try {
                        const errorObject = JSON.parse(errorResponseText);
                        if (errorObject.message) {
                            errorMessage = errorObject.message;
                        }
                    } catch (err) {
                        //Eat it
                    }

                    return <Promise<TReturn>>Promise.reject(new Error(errorMessage));
                });
        }
    }
}