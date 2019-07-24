import "core-js/fn/promise"

export default class zFetchz {
  private interceptArr: InterceptFuncObj[] = [];
  public originFetch: Function = () => {};
  public newFetch: Function = () => {};
  public interceptor: InterceptInitObj = {
    register: () => {},
    clear: () => {}
  };
  public constructor(env: string, timeout: number = 5000) {
    if (env === 'browser' && !window.fetch) {
      try {
        require('whatwg-fetch')
        this.originFetch = window.fetch;
      } catch (err) {
        throw Error('No fetch avaibale. Unable to register fetch-intercept');
      }
    } else if(env === 'browser' && window.fetch) {
      // fixed: Fetch TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation
      this.originFetch = window.fetch.bind(window)
    }
    if (env === 'node') {
      try {
        this.originFetch = require('node-fetch');
      } catch (err) {
        throw Error('No fetch avaibale. Unable to register fetch-intercept');
      }
    }
    this.newFetch = (url: string, opts: object): Promise<any> => {
      const fetchPromise: Promise<any> = this.originFetch(url, opts);
      const timeoutPromise: Promise<any> = new Promise(function (resolve, reject) {
        setTimeout(() => {
          reject(new Error(`Fetch Timeout ${timeout}`));
        }, timeout);
      })
      return Promise.race([fetchPromise, timeoutPromise]);
    }
    this.interceptor = this.init();
  }

  /**
   * init interceptor
   */
  private init(): InterceptInitObj {
    const that = this;
    this.newFetch = (function (fetch: Function): Function {
      return function (...args: any[]): Promise<any> {
        return that.packageIntercept(fetch, ...args);
      }
    })(this.newFetch)

    return {
      register: (interceptFuncObj: InterceptFuncObj): Function => {
        this.interceptArr.push(interceptFuncObj);
        return () => { // use to unregister
          const index: number = this.interceptArr.indexOf(interceptFuncObj);
          if (index >= 0) {
            this.interceptArr.splice(index, 1);
          }
        }
      },
      clear: (): void => {
        this.interceptArr = [];
      }
    }
  }

  /**
   * setting the request and response intercept
   */
  private packageIntercept(fetch: Function, ...args: any[]): Promise<any> {
    let promise = Promise.resolve(args);
    this.interceptArr.forEach(({ request, requestError }: InterceptFuncObj)  => {
      if (request && requestError) {
        promise = promise.then((args: any[]) => request(...args), requestError());
      } else if (request && !requestError) {
        promise = promise.then((args: any[]) => request(...args));
      } else if (!request && requestError) {
        promise = promise.then((args: any[]) => args, requestError());
      }
    })
    promise = promise.then((args: any[]) => fetch(...args));
    this.interceptArr.forEach(({ response, responseError }: InterceptFuncObj)  => {
      if (response && responseError) {
        promise = promise.then((args: any[]) => response(...args), (args: any[]) => responseError(...args));
      } else if (response && !responseError) {
        promise = promise.then((args: any[]) => {
          return response(args)
        });
      } else if (!response && responseError) {
        promise = promise.then((args: any[]) => args, (e: any) => responseError(e));
      }
    })
    return promise;
  }
}

interface InterceptInitObj {
  register: Function,
  clear: Function
};

interface InterceptFuncObj {
  request?: Function,
  requestError?: Function,
  response?: Function,
  responseError?: Function
};
