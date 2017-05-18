import {HttpServiceProxy} from './data-proxies/service/HttpServiceProxy';
import {IServiceProxy, IServiceResponse, IServiceResponseError} from './data-proxies/service/ServiceProxy';
import {IServiceResponseListener, ServiceProxyResponseEvent} from './data-proxies/service/ServiceProxyResponseEvent';
import {
    MockServiceProxy,
    ILoggedServiceCall,
    IMockServiceOperation,
    ServiceOperationTypeEnum
} from './data-proxies/service/MockServiceProxy';
import {IKeyValueStorageProxy} from '././data-proxies/key-value-storage/KeyValueStorageProxy';
import {LocalForageProxy} from './data-proxies/key-value-storage/LocalForageProxy';
import {LocalStorageProxy} from './data-proxies/key-value-storage/LocalStorageProxy';
import {MockKeyValueStorageProxy} from './data-proxies/key-value-storage/MockKeyValueStorageProxy';
import {CircularSerializer} from './data-proxies/serializers/CircularSerializer';

export {
    IServiceProxy, HttpServiceProxy, MockServiceProxy,
    ILoggedServiceCall, IMockServiceOperation, ServiceOperationTypeEnum, IServiceResponse, IServiceResponseError,
    IServiceResponseListener, ServiceProxyResponseEvent,
    IKeyValueStorageProxy, LocalStorageProxy, LocalForageProxy, MockKeyValueStorageProxy,
    CircularSerializer
}