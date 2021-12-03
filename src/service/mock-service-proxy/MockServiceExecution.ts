import { IHttpHeaders, IServiceCallOptions, IServiceResponse } from '../ServiceProxy';
import { IConnectivityMonitor, MockConnectivityMonitor } from '../ConnectivityMonitor';
import { MockServiceParameters } from './MockServiceParameters';
import { ServiceOperationTypeEnum, IMockServiceOperation } from './MockServiceOperations';
import { GlobalResponseHeaders } from './GlobalResponseHeaders';
import { IMockServiceProxyOptions } from './MockServiceProxyOptions';
import { MockServiceOperations } from './MockServiceOperations';
import { MockServiceRequestValidator } from './MockServiceRequestValidator';
import { ServiceProxyResponseEvent } from '../ServiceProxyResponseEvent';
import { ServiceProxyError } from '../ServiceProxyError';

export interface ILoggedServiceCall {
    urlMatches: RegExpMatchArray;
    response: IServiceResponse<any>;
    requestBody: any;
    headers: IHttpHeaders
}

export class MockServiceExecution {
    public loggedCalls: ILoggedServiceCall[] = [];
    private parameters: MockServiceParameters;
    private globalResponseHeaders: GlobalResponseHeaders;
    private options: IMockServiceProxyOptions;
    private operations: MockServiceOperations;
    private requestValidator: MockServiceRequestValidator;
    private serviceProxyResponseEvent: ServiceProxyResponseEvent;
    private globalHeaders: IHttpHeaders = {};

    constructor(
        options: IMockServiceProxyOptions,
        operations: MockServiceOperations,
        parameters: MockServiceParameters,
        globalResponseHeaders: GlobalResponseHeaders,
        serviceProxyResponseEvent: ServiceProxyResponseEvent,
        globalHeaders: IHttpHeaders
    ) {
        this.options = options;
        this.operations = operations;
        this.parameters = parameters;
        this.globalResponseHeaders = globalResponseHeaders,
        this.requestValidator = new MockServiceRequestValidator(null);
        this.serviceProxyResponseEvent = serviceProxyResponseEvent;
        this.globalHeaders = globalHeaders;
    }

    public fakeAjaxCall<TData, TReturn>(
        operationType: ServiceOperationTypeEnum,
        resourcePath: string,
        data: TData,
        options: IServiceCallOptions
    ) {
        const matchingOperations = this.operations.getMatchingOperations<TData, TReturn>(operationType, resourcePath);

        return this.requestValidator
            .validateRequest(operationType, resourcePath, matchingOperations)
            .then(() => {
                return this.executeServiceOperation(resourcePath, matchingOperations[0], data, options);
            });
    }

    public listenToConnectivityMonitor(connectivityMonitor: MockConnectivityMonitor) {
        this.requestValidator = new MockServiceRequestValidator(connectivityMonitor);
    }

    private waitForRandomDelay() {
        return new Promise<void>(resolve => {
            let timeout : number;
            const randomDelayMilliseconds = this.options.maxRandomDelayMilliseconds || 1500;

            timeout = this.options.addRandomDelays ? (Math.random() * randomDelayMilliseconds) : 0;

            if (timeout === 0) {
                resolve();
            } else {
                setTimeout(() => resolve(), timeout);
            }
        });
    }

    private executeServiceOperation<TData, TReturn>(
        resourcePath: string,
        serviceOperation: IMockServiceOperation<TData, TReturn>,
        requestBody: TData,
        options: IServiceCallOptions
    ) {
        const headersFromOptions = options && options.headers || {};
        const defaultHeaders: { [header: string]: string } = {};
        let acceptHeaderOverridden = false;
        let contentTypeHeaderOverridden = false;

        return this.waitForRandomDelay()
            .then(() => {
                let urlMatches: RegExpMatchArray;
                let response: IServiceResponse<TReturn>;

                urlMatches = resourcePath.match(serviceOperation.urlRegex);

                try {
                    response = serviceOperation.response(urlMatches, requestBody, this.parameters.params);
                } catch (error) {
                    const errorMessage = `An error occurred when executing a ${serviceOperation.operationType} request to ${resourcePath}: ${error.message}`;
                    console.warn(errorMessage);

                    response = {
                        status: 500,
                        responseBody: { message: errorMessage }
                    }
                }

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

                let headers: IHttpHeaders = { ...defaultHeaders, ...this.globalHeaders, ...headersFromOptions };

                this.loggedCalls.push({
                    urlMatches,
                    response,
                    requestBody,
                    headers
                });

                this.globalResponseHeaders.addGlobalResponseHeaders(response);

                this.serviceProxyResponseEvent.fire(response);

                if (response.status >= 400) {
                    throw new ServiceProxyError(resourcePath, response.status, response.responseBody);
                }

                return <TReturn>response.responseBody;
            });
    }
}