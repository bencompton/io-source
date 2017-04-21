import {HttpServiceProxy} from './data-proxies/service/HttpServiceProxy';
import {IServiceProxy} from './data-proxies/service/ServiceProxy';
import {
    MockServiceProxy,
    ILoggedServiceCall,
    IMockResponse,
    IMockResponseError,
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
    ILoggedServiceCall, IMockResponse, IMockResponseError, IMockServiceOperation, ServiceOperationTypeEnum,
    IKeyValueStorageProxy, LocalStorageProxy, LocalForageProxy, MockKeyValueStorageProxy,
    CircularSerializer
}