import { IServiceProxy } from './ServiceProxy';
import { ServiceProxyResponseEvent } from './ServiceProxyResponseEvent';
import { MockConnectivityMonitor } from './ConnectivityMonitor';
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

    constructor(options: IMockServiceProxyOptions) {
        this.options = options;
        this.operations = new MockServiceOperations();
        this.serviceProxyResponseEvent = new ServiceProxyResponseEvent();
        this.parameters = new MockServiceParameters();
        this.globalResponseHeaders = new GlobalResponseHeaders();
        this.execution = new MockServiceExecution(
            this.options,
            this.operations,
            this.parameters,
            this.globalResponseHeaders,
            this.serviceProxyResponseEvent
        );
        this.serviceDefinitions = new MockServiceDefinitions(this.operations);
    }

    public listenToConnectivityMonitor(connectivityMonitor: MockConnectivityMonitor) {
        this.execution.listenToConnectivityMonitor(connectivityMonitor);
    }

    public createViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('create', resourcePath, data);
    }

    public readViaService<T>(resourcePath: string): Promise<T> {
        return this.execution.fakeAjaxCall<void, T>('read', resourcePath, null);
    }

    public patchViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('patch', resourcePath, data);
    }

    public updateViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('update', resourcePath, data);
    }

    public deleteViaService<TData, TReturn>(resourcePath: string, data: TData): Promise<TReturn> {
        return this.execution.fakeAjaxCall<TData, TReturn>('delete', resourcePath, data);
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