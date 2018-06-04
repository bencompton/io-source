import * as localForage from 'localforage';

import {IKeyValueStorageProxy} from './KeyValueStorageProxy';
import {ISerializer} from '../serializers/serializer';

export class LocalForageProxy implements IKeyValueStorageProxy {
    private localForageStore: LocalForage;
    private serializer: ISerializer;

    constructor(serializer: ISerializer) {
        this.serializer = serializer;

        this.localForageStore = localForage.createInstance({
            driver: <any[]>[localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE]
        });
    }

    public getKeys(): Promise<string[]> {
        return this.localForageStore.keys();
    }

    public getItem<T>(key: string) {
        return this.localForageStore.getItem<T>(key)
            .then((value: T) => {
                if (this.serializer === JSON) {
                    return value;
                } else {
                    if (value) {
                        return this.serializer.parse(<any>value) as T;
                    } else {
                        throw new Error(`Key ${key} not found`);
                    }
                }
            });
    }

    public setItem<T>(key: string, value: T) {
        let processedValue: any = value;

        if (this.serializer !== JSON) {
            processedValue = this.serializer.stringify(value);
        } else {
            processedValue = value;
        }

        return this.localForageStore.setItem(key, processedValue);
    }

    public getString(key: string) {
        return this.getItem<string>(key);
    }

    public setString(key: string, value: string) {
        return this.setItem(key, value);
    }

    public removeItem(key: string) {
        return this.localForageStore.removeItem(key)
            .then(() => {
                return Promise.resolve();
            });
    }
}