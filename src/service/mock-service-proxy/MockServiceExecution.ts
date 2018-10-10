import { IServiceResponse } from '../ServiceProxy';
import { IConnectivityMonitor } from '../ConnectivityMonitor';
import { MockServiceParameters } from './MockServiceParameters';
import { ServiceOperationTypeEnum, IMockServiceOperation } from './MockServiceOperations';
import { GlobalResponseHeaders } from './GlobalResponseHeaders';
import { IMockServiceProxyOptions } from './MockServiceProxyOptions';
import { MockServiceOperations } from './MockServiceOperations';
import { MockServiceRequestValidator } from './MockServiceRequestValidator';
import { ServiceProxyResponseEvent } from '../ServiceProxyResponseEvent';

export interface ILoggedServiceCall {
    urlMatches: RegExpMatchArray;
    response: IServiceResponse<any>;
    requestBody: any;
}

export class MockServiceExecution {
    public loggedCalls: ILoggedServiceCall[] = [];
    private parameters: MockServiceParameters;
    private globalResponseHeaders: GlobalResponseHeaders;
    private options: IMockServiceProxyOptions;
    private operations: MockServiceOperations;
    private requestValidator: MockServiceRequestValidator;
    private serviceProxyResponseEvent: ServiceProxyResponseEvent;

    constructor(
        options: IMockServiceProxyOptions,
        operations: MockServiceOperations,
        connectivityMonitor: IConnectivityMonitor,
        parameters: MockServiceParameters,
        globalResponseHeaders: GlobalResponseHeaders,
        serviceProxyResponseEvent: ServiceProxyResponseEvent
    ) {
        this.options = options;
        this.operations = operations;
        this.parameters = parameters;
        this.globalResponseHeaders = globalResponseHeaders,
        this.requestValidator = new MockServiceRequestValidator(connectivityMonitor);
        this.serviceProxyResponseEvent = serviceProxyResponseEvent;
    }

    public fakeAjaxCall<TData, TReturn>(
        operationType: ServiceOperationTypeEnum,
        resourcePath: string,
        data: TData
    ) {
        const matchingOperations = this.operations.getMatchingOperations<TData, TReturn>(operationType, resourcePath);

        return this.requestValidator
            .validateRequest(operationType, resourcePath, matchingOperations)
            .then(() => {
                return this.executeServiceOperation(resourcePath, matchingOperations[0], data);
            });
    }

    private waitForRandomDelay() {
        return new Promise(resolve => {
            let timeout : number;

            timeout = this.options.addRandomDelays ? (Math.random() * 500) : 0;
            
            setTimeout(() => resolve(), timeout);
        });
    }

    private executeServiceOperation<TData, TReturn>(
        resourcePath: string,
        serviceOperation: IMockServiceOperation<TData, TReturn>,
        requestBody: TData
    ) {
        return this.waitForRandomDelay()
            .then(() => {
                let urlMatches: RegExpMatchArray;
                let response: IServiceResponse<TReturn>;

                urlMatches = resourcePath.match(serviceOperation.urlRegex);
                response = serviceOperation.response(urlMatches, requestBody, this.parameters);                    

                this.loggedCalls.push({
                    urlMatches,
                    response,
                    requestBody
                });

                this.globalResponseHeaders.addGlobalResponseHeaders(response);
                
                this.serviceProxyResponseEvent.fire(response); 

                return <TReturn>response.responseBody;
            });
    }       
}