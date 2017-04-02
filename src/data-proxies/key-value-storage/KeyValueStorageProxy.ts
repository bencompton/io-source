import {ISerializer} from '../serializers/Serializer';

export interface IKeyValueStorageProxy {
    getItem<T>(name: string): Promise<T>;
    setItem<T>(name: string, data: T): Promise<void>;
}

export abstract class KeyValueStorageProxy implements IKeyValueStorageProxy {
    private serializer: ISerializer;
    private dataMap: { [key: string]: any };

    constructor(serializer: ISerializer, dataMap: {[key: string]: any}) {
        this.serializer = serializer;
        this.dataMap = dataMap;
    }

    public getItem<T>(name: string): Promise<T> {
        return this
            .getItemString(name)
            .then(itemString => {
                if (itemString) {
                    return this.serializer.parse<T>(itemString);
                } else {
                    return undefined;
                }
            });
    }

    public setItem<T>(name: string, data: T): Promise<void> {
        let stringifiedData: string;

        if (typeof data === 'string') {
            stringifiedData = data;
        } else {
            stringifiedData = this.serializer.stringify<T>(data);
        }

        return this.setItemString(name, <string>stringifiedData);
    }

    public getItemString(name: string): Promise<string> {
        return Promise.resolve(this.dataMap[name]);
    }

    public setItemString(name: string, data: string): Promise<void> {
        this.dataMap[name] = data;
        return Promise.resolve(null);
    }
}