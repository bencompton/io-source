import {IServiceResponse} from './ServiceProxy';

export interface IServiceResponseListener {
    (response: IServiceResponse<any>, url?: string): void;
}

export class ServiceProxyResponseEvent {
    private listeners: IServiceResponseListener[] = [];

    public listen(callback: IServiceResponseListener) {
        this.listeners.push(callback);
    }

    public fire(response: IServiceResponse<any>, url?: string) {
        this.listeners.forEach(listener => {
            listener(response, url);
        });
    }
}