import 'whatwg-fetch';

import {ISerializer} from '../serializers/Serializer';
import {IServiceProxy, IServiceCallOptions} from './ServiceProxy';
import {ServiceProxyResponseEvent} from './ServiceProxyResponseEvent';
import {ServiceProxyError} from './ServiceProxyError';

export class HttpServiceProxy implements IServiceProxy {
    private serializer: ISerializer;
    private globalHeaders: { [headerName: string]: string};
    private baseUrl: string | null;
    private serviceProxyResponseEvent: ServiceProxyResponseEvent

    constructor(baseUrl: string | null = null, serializer: ISerializer = JSON) {
        this.serializer = serializer;
        this.globalHeaders = {};
        this.baseUrl = baseUrl;
        this.serviceProxyResponseEvent = new ServiceProxyResponseEvent();
    }

    public get responseEvent() {
        return this.serviceProxyResponseEvent;
    }

    public addGlobalRequestHeader(headerName: string, headerValue: string) {
        this.globalHeaders[headerName] = headerValue;
    }

    public createViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn> {
        return this.ajaxRequest<TData, TReturn>('POST', resourcePath, data, options);
    }

    public readViaService<T>(resourcePath: string, options?: IServiceCallOptions): Promise<T> {
        return this.ajaxRequest<void, T>('GET', resourcePath, null, options);
    }

    public updateViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn> {
        return this.ajaxRequest<TData, TReturn>('PUT', resourcePath, data, options);
    }

    public deleteViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn> {
        return this.ajaxRequest<TData, TReturn>('DELETE', resourcePath, data, options);
    }

    private ajaxRequest<TData, TReturn>(
        verb: string,
        resourcePath: string,
        data?: TData,
        options?: IServiceCallOptions
    ): Promise<TReturn> {
        const url = this.baseUrl ? this.baseUrl + resourcePath : resourcePath;
        const deserializeResponse = (options && options.deserializeResponse) !== undefined ? options.deserializeResponse : true;
        const returnRawResponseBlob = (options && options.returnRawResponseBlob) !== undefined ? options.returnRawResponseBlob : false;
        const serializeRequest = (options && options.serializeRequest) !== undefined ? options.serializeRequest : true;
        const headersFromOptions = options && options.headers || {};
        const defaultHeaders: { [header: string]: string } = {};

        let acceptHeaderOverridden = false;
        let contentTypeHeaderOverridden = false;

        if (options && options.headers) {
            Object.keys(options.headers).forEach((header) => {
                const lowerCaseHeader = header.toLocaleLowerCase();

                if (lowerCaseHeader === 'accept') {
                    acceptHeaderOverridden = true;
                }

                if (lowerCaseHeader === 'content-type') {
                    contentTypeHeaderOverridden = true;
                }
            });
        }

        if (!contentTypeHeaderOverridden) {
            defaultHeaders['content-type'] = 'application/json';
        }

        if (!acceptHeaderOverridden) {
            defaultHeaders['accept'] = 'application/json';
        }

        const config: any = {
            method: verb,
            credentials: 'include'
        };

        config.headers = { ...defaultHeaders, ...this.globalHeaders, ...headersFromOptions };

        if (verb !== 'GET') {
            if (serializeRequest) {
                config.body = this.serializer.stringify(data);
            } else {
                config.body = data;
            }
        }

        return fetch(url, config)
            .then(response => {
                return <Promise<TReturn>>this.handleResponse(
                    url,
                    response,
                    deserializeResponse,
                    returnRawResponseBlob
                );
            });
    }

    private async handleResponse<TReturn>(
        url: string,
        response: Response,
        deserializeResponse: boolean,
        returnRawResponseBlob: boolean
    ): Promise<TReturn> {
        if (response.status >= 200 && response.status < 400) {
            let responseBody: TReturn = null;

            if (returnRawResponseBlob) {
                responseBody = await response.blob() as any;
            } else {
                const responseJson = await response.text()

                if (deserializeResponse && !!responseJson) {
                    responseBody = this.serializer.parse<TReturn>(responseJson);
                } else {
                    responseBody = <TReturn>(<any>responseJson);
                }
            }

            this.serviceProxyResponseEvent.fire({ status: response.status, responseBody, headers: response.headers }, url);

            return responseBody;
        } else {
            return response.text()
                .then(errorResponseText => {
                    const error = new ServiceProxyError(url, response.status, errorResponseText);

                    this.serviceProxyResponseEvent.fire({ status: response.status, responseBody: errorResponseText, headers: response.headers }, url);

                    return <Promise<TReturn>>Promise.reject(error);
                });
        }
    }
}