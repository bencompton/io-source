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

export interface IServiceProxy {    
    createViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse?: boolean): Promise<TReturn>;
    readViaService<T>(resourcePath: string, deserializeResponse?: boolean): Promise <T>;
    updateViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse?: boolean): Promise <TReturn>;
    deleteViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse?: boolean): Promise <TReturn>;
    responseEvent: ServiceProxyResponseEvent;    
}