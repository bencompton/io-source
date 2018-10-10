export class MockServiceParameters {
    public params: any = {};

    public setParams(params: any) {
        this.params = params;
    }

    public setParam(paramName: string, paramValue: any) {
        this.params[paramName] = paramValue;
    }
}