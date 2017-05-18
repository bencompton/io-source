import {IServiceResponse} from './ServiceProxy';

export interface IServiceResponseListener {
    (response: IServiceResponse<any>): void;
}

export class ServiceProxyResponseEvent {
    private listeners: IServiceResponseListener[] = [];

    public listen(callback: IServiceResponseListener) {
        this.listeners.push(callback);
    }

    public fire(response: IServiceResponse<any>) {
        this.listeners.forEach(listener => {
            listener(response);
        });
    }
}