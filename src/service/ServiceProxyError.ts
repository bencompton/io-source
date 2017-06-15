export class ServiceProxyError extends Error {    
    public readonly httpStatus: number;
    public readonly responseText: string
    public readonly details: any;

    constructor(url: string, httpStatus: number, responseBody: any) {
        super(`Service call to ${url} resulted in an error with status code ${httpStatus}. See the details and responseText properties for more info.`);
        
        Object.setPrototypeOf(this, ServiceProxyError.prototype);
        
        this.httpStatus = httpStatus;

        if (typeof responseBody === 'string') {
            this.responseText = responseBody;

            try {
                const details = JSON.parse(responseBody);

                if (typeof details === 'object') {
                    this.details = details;
                }
            } catch (e) {
                //Eat it
            }            
        } else if (typeof responseBody === 'object') {
            this.responseText = JSON.stringify(responseBody);
            this.details = responseBody;
        }
    }
}