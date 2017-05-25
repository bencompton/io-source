import {IServiceProxy} from './ServiceProxy';

export const enum ConnectionStatusEnum {
    Connected,
    Disconnected
}

export interface IConnectivityMonitor {
    getConnectionStatus: () => ConnectionStatusEnum;
    setConnectionStatus: (connectionStatus: ConnectionStatusEnum) => void;
    listen: (listener: (connectionStatus: ConnectionStatusEnum) => void) => void;
}

export class ConnectivityMonitor implements IConnectivityMonitor {
    private serviceProxy: IServiceProxy;
    private connectionStatus: ConnectionStatusEnum;
    private listener: (connectionStatus: ConnectionStatusEnum) => void;
    private confirmConnectivityUrl: string;

    constructor(serviceProxy: IServiceProxy, confirmConnectivityUrl: string) {
        this.serviceProxy = serviceProxy;
        this.confirmConnectivityUrl = confirmConnectivityUrl;
    }

    public getConnectionStatus(): ConnectionStatusEnum {
        return this.connectionStatus;
    }

    public setConnectionStatus(connectionStatus: ConnectionStatusEnum) {
        this.connectionStatus = connectionStatus;
    }

    public listen(listener: (connectionStatus: ConnectionStatusEnum) => void) {
        this.listener = listener;
        this.startMonitoring();
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
        return this.serviceProxy
            .readViaService(this.confirmConnectivityUrl, null)
            .then(() => {
                this.connectionStatus = ConnectionStatusEnum.Connected;
                this.listener(this.connectionStatus);
            })
            .catch(() => {
                this.connectionStatus = ConnectionStatusEnum.Disconnected;
                this.listener(this.connectionStatus);
            });
    }
}

export class MockConnectivityMonitor implements IConnectivityMonitor {
    private serviceProxy: IServiceProxy;
    private connectionStatus: ConnectionStatusEnum;
    private listener: (connectionStatus: ConnectionStatusEnum) => void;

    constructor(serviceProxy: IServiceProxy) {
        this.serviceProxy = serviceProxy;
    }

    public getConnectionStatus(): ConnectionStatusEnum {
        return this.connectionStatus;
    }

    public setConnectionStatus(connectionStatus: ConnectionStatusEnum) {
        this.connectionStatus = connectionStatus;
        this.listener(this.connectionStatus);
    }

    public listen(listener: (connectionStatus: ConnectionStatusEnum) => void) {
        this.listener = listener;
    }
}