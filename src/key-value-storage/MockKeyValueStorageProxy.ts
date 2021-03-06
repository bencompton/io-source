﻿import {IKeyValueStorageProxy} from './KeyValueStorageProxy';

export class MockKeyValueStorageProxy implements IKeyValueStorageProxy {
    private data: {[key: string]: any} = {};

    public getKeys(): Promise<string[]> {
        return Promise.resolve(Object.keys(this.data));
    }

    public getItem<T>(name: string): Promise<T> {
        return Promise.resolve<T>(this.data[name]);
    }

    public setItem<T>(name: string, data: T): Promise<void> {
        this.data[name] = data;
        return Promise.resolve();
    }

    public getString(name: string) {
        return this.getItem<string>(name);
    }

    public setString(name: string, value: string) {
        return this.setItem(name, value);
    }

    public removeItem(name: string): Promise<void> {
        delete this.data[name];
        return Promise.resolve();
    }
}