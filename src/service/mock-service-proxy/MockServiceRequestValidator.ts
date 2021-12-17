import { ServiceOperationTypeEnum, IMockServiceOperation } from './MockServiceOperations';
import { ServiceProxyError } from '../ServiceProxyError';

export class MockServiceRequestValidator {
    private isOnline: boolean = false;

    public validateRequest<TData, TReturn>(
        operationType: ServiceOperationTypeEnum,
        resourcePath: string,
        matchingOperations: IMockServiceOperation<any, any>[]
    ) {
        if (!this.isOnline) {
            const error = 'Could not call service operation because there is no connectivity';
            console.warn(error);
            throw new ServiceProxyError(resourcePath, 400, error);
        }

        if (matchingOperations.length > 1) {  
            const error = `More than 1 ${operationType} service operation found for URL '${resourcePath}'`;
            console.warn(error);
            throw new ServiceProxyError(resourcePath, 400, error);
        }

        if (matchingOperations.length === 0) {
            const error = `A ${operationType} service operation was not found for URL '${resourcePath}'!`;
            console.warn(error);
            throw new ServiceProxyError(resourcePath, 400, error);                    
        }
    }

    public setConnectivityStatus(isOnline: boolean) {
        this.isOnline = isOnline;
    }
}