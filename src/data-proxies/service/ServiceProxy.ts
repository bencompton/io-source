export interface IServiceProxy {
    addGlobalHeader(headerName: string, headerValue: string): void;
    createViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse?: boolean): Promise<TReturn>;
    readViaService<T>(resourcePath: string, deserializeResponse?: boolean): Promise <T>;
    updateViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse?: boolean): Promise <TReturn>;
    deleteViaService<TData, TReturn>(resourcePath: string, data: TData, deserializeResponse?: boolean): Promise <TReturn>;
}