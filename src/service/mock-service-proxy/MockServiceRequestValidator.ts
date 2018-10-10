import { ServiceOperationTypeEnum, IMockServiceOperation } from './MockServiceOperations';
import { IConnectivityMonitor, ConnectionStatusEnum } from '../ConnectivityMonitor';
import { ServiceProxyError } from '../ServiceProxyError';

export class MockServiceRequestValidator {
    private connectivityMonitor: IConnectivityMonitor;

    constructor(connectivityMonitor: IConnectivityMonitor) {
        this.connectivityMonitor = connectivityMonitor;
    }

    public validateRequest<TData, TReturn>(
        operationType: ServiceOperationTypeEnum,
        resourcePath: string,
        matchingOperations: IMockServiceOperation<any, any>[]
    ) {
        return Promise.resolve()
            .then(() => {
                if (this.connectivityMonitor) {
                    return this.connectivityMonitor.getConnectionStatus();
                } else {
                    return Promise.resolve(null as ConnectionStatusEnum);
                }
            })
            .then(connectivityStatus => {
                if (connectivityStatus && connectivityStatus === 'disconnected') {
                    const error = 'Could not call service operation because there is no connectivity';
                    console.warn(error);
                    throw new ServiceProxyError(resourcePath, 400, error);
                }

                if (matchingOperations.length > 1) {  
                    const error = `More than 1 matching service operation found for URL '${resourcePath}'`;
                    console.warn(error);
                    throw new ServiceProxyError(resourcePath, 400, error);
                }

                if (matchingOperations.length === 0) {
                    const error = `The URL '${resourcePath}' was not found for the operation type ${operationType}!`;
                    console.warn(error);
                    throw new ServiceProxyError(resourcePath, 400, error);                    
                }
            });
    }
}