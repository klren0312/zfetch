import zFetch from "../src/zfetch"

/**
 * zFetch test
 */
describe("zFetch test", () => {
  it("zFetch is instantiable", () => {
    expect(new zFetch('node')).toBeInstanceOf(zFetch);
  })
})

/**
 * zFetch timeout test
 */
describe('zfetch timeout test', () => {
  const zfetch = new zFetch('node', 2000);
  const zFetchInterceptor = zfetch.interceptor;
  beforeEach(() => {
    zFetchInterceptor.clear();
  });
  
  it('should fetch timeout', (done) => {
    expect(
      zfetch.newFetch('https://xvideos.com', {
        mode: 'no-cors'
      })
    ).rejects.toThrowError();
    done();
  })
})

/**
 * zFetch interceptor test
 */
describe('zfetch interceptor test', () => {
  const zfetch = new zFetch('node', 5000);
  const zFetchInterceptor = zfetch.interceptor;
  beforeEach(() => {
    zFetchInterceptor.clear();
  });

  it('should unregister a registered interceptor', function (done) {
    let requestIntercepted = false;

    const unregister = zFetchInterceptor.register({
      request: function (...args: any[]) {
        requestIntercepted = true;
        return args;
      }
    });

    unregister();

    zfetch.newFetch('https://baidu.com', {
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

    zFetchInterceptor.register({
      request: function (...args: any[]) {
        requestIntercepted = true;
        return args;
      },
      response: function (response: any) {
        responseIntercepted = true;
        return response;
      }
    });

    zfetch.newFetch('https://baidu.com', {
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

    zFetchInterceptor.register({
      responseError: function (error: any) {
        responseIntercepted = true;
        return Promise.reject(error);
      }
    });

    zfetch.newFetch('http://zzes1314.cn/testesssssst.html', {
      mode: 'no-cors'
    })
    .catch(function (e: any) {
      expect(responseIntercepted).toBe(true);
      done();
    });
  });

  it('should intercept request errors', function (done) {
    let requestIntercepted = false;

    zFetchInterceptor.register({
      request: function () {
        throw new Error('Error');
      },
      requestError: function (error: any) {
        requestIntercepted = true;
        return Promise.reject(error);
      }
    });

    zfetch.newFetch('http://google.com', {
      mode: 'no-cors'
    })
    .catch(function () {
      expect(requestIntercepted).toBe(true);
      done();
    });
  });
})

