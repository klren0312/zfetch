import "core-js/fn/promise";
export default class zFetchz {
    private interceptArr;
    originFetch: Function;
    newFetch: Function;
    interceptor: InterceptInitObj;
    constructor(env: string, timeout?: number);
    /**
     * init interceptor
     */
    private init;
    /**
     * setting the request and response intercept
     */
    private packageIntercept;
}
interface InterceptInitObj {
    register: Function;
    clear: Function;
}
export {};
