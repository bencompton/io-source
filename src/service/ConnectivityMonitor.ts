import {IServiceProxy} from './ServiceProxy';

export type ConnectionStatusEnum = 'connected' | 'disconnected';

export interface IConnectivityMonitor {
    getConnectionStatus: () => Promise<ConnectionStatusEnum>;
    listen: (listener: (connectionStatus: ConnectionStatusEnum) => void) => void;
}

export class ConnectivityMonitor implements IConnectivityMonitor {
    private serviceProxy: IServiceProxy;
    private connectionStatus: ConnectionStatusEnum;
    private listener: (connectionStatus: ConnectionStatusEnum) => void;
    private confirmConnectivityUrl: string;
    private confirmConnectivityPromise: Promise<void>;

    constructor(serviceProxy: IServiceProxy, confirmConnectivityUrl: string) {
        this.serviceProxy = serviceProxy;
        this.confirmConnectivityUrl = confirmConnectivityUrl;
        this.connectionStatus = navigator.onLine ? 'connected' : 'disconnected';
        this.confirmConnectivityPromise = Promise.resolve();
        this.startMonitoring();
    }

    public getConnectionStatus() {
        return this.confirmConnectivityPromise
            .then(() => this.connectionStatus);
    }

    public listen(listener: (connectionStatus: ConnectionStatusEnum) => void) {
        this.listener = listener;        
    }

    private startMonitoring(): void {
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('online', () => {
                return setTimeout(() => {
                    this.confirmConnectivity();
                }, 100);
            }, false);
        }

        if (typeof window.addEventListener === 'function') {
            window.addEventListener('offline', () => {
                return this.confirmConnectivity();
            }, false);
        }
    }

    private confirmConnectivity() {
        this.confirmConnectivityPromise = this.serviceProxy
            .readViaService(this.confirmConnectivityUrl, null)
            .then(() => {
                this.connectionStatus = 'connected';
                this.listener(this.connectionStatus);
            })
            .catch(() => {
                this.connectionStatus = 'disconnected';
                this.listener(this.connectionStatus);
            });

        return this.confirmConnectivityPromise;
    }
}

export class MockConnectivityMonitor implements IConnectivityMonitor {
    private serviceProxy: IServiceProxy;
    private connectionStatus: ConnectionStatusEnum;
    private listener: (connectionStatus: ConnectionStatusEnum) => void;

    constructor(serviceProxy: IServiceProxy) {
        this.serviceProxy = serviceProxy;
        this.connectionStatus = 'connected';
    }

    public getConnectionStatus() {
        return Promise.resolve(this.connectionStatus);
    }

    public setConnectionStatus(connectionStatus: ConnectionStatusEnum) {
        this.connectionStatus = connectionStatus;
        this.listener(this.connectionStatus);
    }

    public listen(listener: (connectionStatus: ConnectionStatusEnum) => void) {
        this.listener = listener;
    }
}