import {ISerializer} from '../serializers/Serializer';

export interface IKeyValueStorageProxy {
    getKeys(): Promise<string[]>;
    getItem<T>(name: string): Promise<T>;
    setItem<T>(name: string, data: T): Promise<void>;
    getString(name: string): Promise<string>;
    setString(name: string, value: string): Promise<void>;
    removeItem(name: string): Promise<void>;    
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
            .getString(name)
            .then(itemString => {
                if (itemString) {
                    return this.serializer.parse<T>(itemString);
                } else {
                    throw new Error(`Value "${name}" does not exist`);
                }
            });
    }

    public getKeys() {
        return Promise.resolve(Object.keys(this.dataMap));
    }

    public removeItem(name: string) {
        delete this.dataMap[name];
        
        return Promise.resolve();
    }

    public setItem<T>(name: string, data: T) {
        let stringifiedData: string;

        if (typeof data === 'string') {
            stringifiedData = data;
        } else {
            stringifiedData = this.serializer.stringify<T>(data);
        }

        return this.setString(name, <string>stringifiedData);
    }

    public getString(name: string): Promise<string> {
        return Promise.resolve(this.dataMap[name]);
    }

    public setString(name: string, data: string) {
        this.dataMap[name] = data;
        return Promise.resolve();
    }
}