﻿import 'whatwg-fetch';

import {ISerializer} from '../serializers/Serializer';
import {IServiceProxy, IServiceResponse, IHttpHeaders} from './ServiceProxy';
import {ServiceProxyResponseEvent} from './ServiceProxyResponseEvent';
import {ServiceProxyError} from './ServiceProxyError';

export class HttpServiceProxy implements IServiceProxy {
    private serializer: ISerializer;
    private globalHeaders: { [headerName: string]: string};
    private baseUrl: string;
    private serviceProxyResponseEvent: ServiceProxyResponseEvent

    constructor(baseUrl: string = '/api/', serializer: ISerializer = JSON) {
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
                return <Promise<TReturn>>this.handleResponse(url, response, deserializeResponse);
            });
    }

    private handleResponse<TReturn>(url: string, response: Response, deserializeResponse: boolean): Promise<TReturn> {
        if (response.status >= 200 && response.status < 400) {
            return response.text()
                .then(responseJson => {
                    let responseBody: TReturn;

                    if (deserializeResponse && !!responseJson) {
                        responseBody = this.serializer.parse<TReturn>(responseJson);
                    } else {
                        responseBody = <TReturn>(<any>responseJson);
                    }

                    this.serviceProxyResponseEvent.fire({ status: response.status, responseBody, headers: this.extractHeaders(response.headers) }, url);

                    return responseBody;
                });
        } else {
            return response.text()
                .then(errorResponseText => {
                    const error = new ServiceProxyError(url, response.status, errorResponseText);

                    this.serviceProxyResponseEvent.fire({ status: response.status, responseBody: errorResponseText, headers: this.extractHeaders(response.headers) }, url);

                    return <Promise<TReturn>>Promise.reject(error);
                });
        }
    }

    private extractHeaders(headers: Headers) {
        const responseHeaders: IHttpHeaders = {};

        headers.forEach((value: string, name: string) => {
            responseHeaders[name] = value;
        });

        return responseHeaders;
    }
}