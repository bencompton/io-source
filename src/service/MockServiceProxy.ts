import { IServiceProxy, IServiceCallOptions, IHttpHeaders } from './ServiceProxy';
import { ServiceProxyResponseEvent } from './ServiceProxyResponseEvent';
import { MockServiceExecution } from './mock-service-proxy/MockServiceExecution';
import { MockServiceParameters } from './mock-service-proxy/MockServiceParameters';
import { GlobalResponseHeaders } from './mock-service-proxy/GlobalResponseHeaders';
import { IMockServiceProxyOptions } from './mock-service-proxy/MockServiceProxyOptions';
import { MockServiceOperations } from './mock-service-proxy/MockServiceOperations';
import { MockServiceDefinitions, IServiceResponseFunction } from './mock-service-proxy/MockServiceDefinitions';

export class MockServiceProxy implements IServiceProxy {
    private options: IMockServiceProxyOptions;
    private operations: MockServiceOperations;
    private parameters: MockServiceParameters;
    private serviceProxyResponseEvent: ServiceProxyResponseEvent;
    private execution: MockServiceExecution;
    private globalResponseHeaders: GlobalResponseHeaders;
    private serviceDefinitions: MockServiceDefinitions;
    private globalHeaders: IHttpHeaders;

    constructor(options: IMockServiceProxyOptions) {
        this.options = options;
        this.operations = new MockServiceOperations();
        this.serviceProxyResponseEvent = new ServiceProxyResponseEvent();
        this.parameters = new MockServiceParameters();
        this.globalResponseHeaders = new GlobalResponseHeaders();
        this.globalHeaders = {};
        this.execution = new MockServiceExecution(
            this.options,
            this.operations,
            this.parameters,
            this.globalResponseHeaders,
            this.serviceProxyResponseEvent,
            this.globalHeaders
        );
        this.serviceDefinitions = new MockServiceDefinitions(this.operations);
        this.execution.setConnectivityStatus(true);
    }

    public setConnectivityStatus(isOnline: boolean) {
        this.execution.setConnectivityStatus(isOnline);
    }

    public createViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('create', resourcePath, data, options);
    }

    public readViaService<T>(resourcePath: string, options?: IServiceCallOptions): Promise<T> {
        return this.execution.fakeAjaxCall<void, T>('read', resourcePath, null, options);
    }

    public patchViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('patch', resourcePath, data, options);
    }

    public updateViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('update', resourcePath, data, options);
    }

    public deleteViaService<TData, TReturn>(resourcePath: string, data: TData, options?: IServiceCallOptions): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('delete', resourcePath, data, options);
    }

    public addCreateOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.serviceDefinitions.addCreateOperation(url, responseFunction);
    }

    public addReadOperation<TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.serviceDefinitions.addReadOperation(url, responseFunction);
    }

    public addPatchOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.serviceDefinitions.addUpdateOperation(url, responseFunction);
    }

    public addUpdateOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.serviceDefinitions.addUpdateOperation(url, responseFunction);
    }

    public addDeleteOperation<TRequest, TResponse>(
        url: string | RegExp,
        responseFunction?: IServiceResponseFunction<TResponse>
    ) {
        this.serviceDefinitions.addDeleteOperation(url, responseFunction);
    }

    public addGlobalRequestHeader(headerName: string, headerValue: string) {
        this.globalHeaders[headerName] = headerValue;
    }

    public addGlobalResponseHeader(name: string, value: (() => string) | string) {
        this.globalResponseHeaders.addGlobalResponseHeader(name, value);
    }

    public addGlobalParameter(name: string, value: any) {
        this.parameters.setParam(name, value);
    }

    public get responseEvent() {
        return this.serviceProxyResponseEvent;
    }

    public get loggedCalls() {
        return this.execution.loggedCalls;
    }
}