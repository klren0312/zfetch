import zFetchz from "../src/zFetchz"

/**
 * zfetchz test
 */
describe("zfetchz test", () => {
  it("zfetchz is instantiable", () => {
    expect(new zFetchz('node')).toBeInstanceOf(zFetchz);
  })
})

/**
 * zfetchz timeout test
 */
describe('zfetchz timeout test', () => {
  const zfetchz = new zFetchz('node', 2000);
  const zfetchzInterceptor = zfetchz.interceptor;
  beforeEach(() => {
    zfetchzInterceptor.clear();
  });
  
  it('should fetch timeout', (done) => {
    expect(
      zfetchz.newFetch('https://xvideos.com', {
        mode: 'no-cors'
      })
    ).rejects.toThrowError();
    done();
  })
})

/**
 * zfetchz interceptor test
 */
describe('zfetchz interceptor test', () => {
  const zfetchz = new zFetchz('node', 5000);
  const zfetchzInterceptor = zfetchz.interceptor;
  beforeEach(() => {
    zfetchzInterceptor.clear();
  });

  it('should unregister a registered interceptor', function (done) {
    let requestIntercepted = false;

    const unregister = zfetchzInterceptor.register({
      request: function (...args: any[]) {
        requestIntercepted = true;
        return args;
      }
    });

    unregister();

    zfetchz.newFetch('https://baidu.com', {
      mode: 'no-cors'
    })
    .then(function () {
      expect(requestIntercepted).toBe(false);
      done();
    });
  });

  it('should intercept(request and response) fetch calls', function (done) {
    let requestIntercepted = false;
    let responseIntercepted = false;

    zfetchzInterceptor.register({
      request: function (...args: any[]) {
        requestIntercepted = true;
        return args;
      },
      response: function (response: any) {
        responseIntercepted = true;
        return response;
      }
    });

    zfetchz.newFetch('https://baidu.com', {
      mode: 'no-cors'
    })
    .then(function () {
      expect(requestIntercepted).toBe(true);
      expect(responseIntercepted).toBe(true);
      done();
    });
  });

  it('should intercept response errors', function (done) {
    let responseIntercepted = false;

    zfetchzInterceptor.register({
      responseError: function (error: any) {
        responseIntercepted = true;
        return Promise.reject(error);
      }
    });

    zfetchz.newFetch('http://zzes1314.cn/testesssssst.html', {
      mode: 'no-cors'
    })
    .catch(function (e: any) {
      expect(responseIntercepted).toBe(true);
      done();
    });
  });

  it('should intercept request errors', function (done) {
    let requestIntercepted = false;

    zfetchzInterceptor.register({
      request: function () {
        throw new Error('Error');
      },
      requestError: function (error: any) {
        requestIntercepted = true;
        return Promise.reject(error);
      }
    });

    zfetchz.newFetch('http://google.com', {
      mode: 'no-cors'
    })
    .catch(function () {
      expect(requestIntercepted).toBe(true);
      done();
    });
  });
})
