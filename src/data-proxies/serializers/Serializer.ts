export interface ISerializer {
    parse<T>(json: string): T;
    stringify<T>(object: T): string;
}