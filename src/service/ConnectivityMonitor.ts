import {IServiceProxy} from './ServiceProxy';

export const enum ConnectionStatusEnum {
    Connected,
    Disconnected
}

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
        this.connectionStatus = navigator.onLine ? ConnectionStatusEnum.Connected : ConnectionStatusEnum.Disconnected;
        this.confirmConnectivityPromise = Promise.resolve(null);
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
                this.connectionStatus = ConnectionStatusEnum.Connected;
                this.listener(this.connectionStatus);
            })
            .catch(() => {
                this.connectionStatus = ConnectionStatusEnum.Disconnected;
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
        this.connectionStatus = ConnectionStatusEnum.Connected;
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