export type Reviver = (key: string, value: any) => any;

export interface ISerializer {
    parse<T>(json: string, reviver?: Reviver): T;
    stringify<T>(object: T): string;
}