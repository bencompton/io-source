import {HttpServiceProxy} from './data-proxies/service/HttpServiceProxy';
import {MockServiceProxy} from './data-proxies/service/MockServiceProxy';
import {LocalForageProxy} from './data-proxies/key-value-storage/LocalForageProxy';
import {LocalStorageProxy} from './data-proxies/key-value-storage/LocalStorageProxy';
import {MockKeyValueStorageProxy} from './data-proxies/key-value-storage/MockKeyValueStorageProxy';
import {CircularSerializer} from './data-proxies/serializers/CircularSerializer';

export {
    HttpServiceProxy, MockServiceProxy,
    LocalStorageProxy, LocalForageProxy, MockKeyValueStorageProxy,
    CircularSerializer
}