import {ISerializer} from '../serializers/Serializer';
import {KeyValueStorageProxy, IKeyValueStorageProxy} from './KeyValueStorageProxy';

export class LocalStorageProxy extends KeyValueStorageProxy implements IKeyValueStorageProxy {
    constructor(serializer: ISerializer) {
        super(serializer, localStorage);
    }
}