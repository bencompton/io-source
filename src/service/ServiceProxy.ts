import {ServiceProxyResponseEvent} from './ServiceProxyResponseEvent';

export interface IHttpHeaders {
    [headerName: string]: string;
}

export interface IServiceResponseError {
    message: string;
}

export interface IServiceResponse<T> {
    status: number;
    responseBody: T | IServiceResponseError;
    headers?: Headers;
}

export interface IServiceCallOptions {
    headers?: IHttpHeaders;
    deserializeResponse?: boolean;
    serializeRequest?: boolean;
}

export interface IServiceProxy {    
    createViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn>;
    readViaService<T>(resourcePath: string, options?: IServiceCallOptions): Promise <T>;
    updateViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise <TReturn>;
    deleteViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise <TReturn>;
    responseEvent: ServiceProxyResponseEvent;    
}