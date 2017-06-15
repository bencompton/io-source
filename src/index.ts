export {HttpServiceProxy} from './service/HttpServiceProxy';
export {IServiceProxy, IServiceResponse, IServiceResponseError} from './service/ServiceProxy';
export {IServiceResponseListener, ServiceProxyResponseEvent} from './service/ServiceProxyResponseEvent';
export {
    MockServiceProxy,
    ILoggedServiceCall,
    IMockServiceOperation,
    ServiceOperationTypeEnum
} from './service/MockServiceProxy';
export {IKeyValueStorageProxy} from './key-value-storage/KeyValueStorageProxy';
export {LocalForageProxy} from './/key-value-storage/LocalForageProxy';
export {LocalStorageProxy} from './key-value-storage/LocalStorageProxy';
export {MockKeyValueStorageProxy} from './key-value-storage/MockKeyValueStorageProxy';
export {CircularSerializer} from './serializers/CircularSerializer';
export {ConnectionStatusEnum, IConnectivityMonitor, ConnectivityMonitor, MockConnectivityMonitor} from './service/ConnectivityMonitor';
export {ServiceProxyError} from './service/ServiceProxyError';