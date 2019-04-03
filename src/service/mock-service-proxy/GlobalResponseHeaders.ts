import { IServiceResponse } from '../ServiceProxy';

export class GlobalResponseHeaders {
    private globalResponseHeaders: {[name: string]: string | (() => string)} = {};

    public addGlobalResponseHeader(name: string, value: (() => string) | string) {
        this.globalResponseHeaders[name] = value;
    }

    public addGlobalResponseHeaders(response: IServiceResponse<any>) {
        const processedGlobalResponseHeaders = Object.keys(this.globalResponseHeaders)
            .reduce((previousHeaderName, currentHeaderName) => {
                const value = this.globalResponseHeaders[currentHeaderName];
                let processedValue: string;

                if (typeof value === 'function') {
                    processedValue = value();
                } else {
                    processedValue = value;
                }
                
                return {
                    ...previousHeaderName,
                    [currentHeaderName]: processedValue
                }                
            }, {});            

        response.headers = {
            ...processedGlobalResponseHeaders,
            ...response.headers            
        };
    }
}