"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/fn/promise");
var zFetchz = /** @class */ (function () {
    function zFetchz(env, timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = 5000; }
        this.interceptArr = [];
        this.originFetch = function () { };
        this.newFetch = function () { };
        this.interceptor = {
            register: function () { },
            clear: function () { }
        };
        if (env === 'browser' && !window.fetch) {
            try {
                require('whatwg-fetch');
                this.originFetch = window.fetch;
            }
            catch (err) {
                throw Error('No fetch avaibale. Unable to register fetch-intercept');
            }
        }
        else if (env === 'browser' && window.fetch) {
            // fixed: Fetch TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation
            this.originFetch = window.fetch.bind(window);
        }
        if (env === 'node') {
            try {
                this.originFetch = require('node-fetch');
            }
            catch (err) {
                throw Error('No fetch avaibale. Unable to register fetch-intercept');
            }
        }
        this.newFetch = function (url, opts) {
            var fetchPromise = _this.originFetch(url, opts);
            var timeoutPromise = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(new Error("Fetch Timeout " + timeout));
                }, timeout);
            });
            return Promise.race([fetchPromise, timeoutPromise]);
        };
        this.interceptor = this.init();
    }
    /**
     * init interceptor
     */
    zFetchz.prototype.init = function () {
        var _this = this;
        var that = this;
        this.newFetch = (function (fetch) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return that.packageIntercept.apply(that, [fetch].concat(args));
            };
        })(this.newFetch);
        return {
            register: function (interceptFuncObj) {
                _this.interceptArr.push(interceptFuncObj);
                return function () {
                    var index = _this.interceptArr.indexOf(interceptFuncObj);
                    if (index >= 0) {
                        _this.interceptArr.splice(index, 1);
                    }
                };
            },
            clear: function () {
                _this.interceptArr = [];
            }
        };
    };
    /**
     * setting the request and response intercept
     */
    zFetchz.prototype.packageIntercept = function (fetch) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var promise = Promise.resolve(args);
        this.interceptArr.forEach(function (_a) {
            var request = _a.request, requestError = _a.requestError;
            if (request && requestError) {
                promise = promise.then(function (args) { return request.apply(void 0, args); }, requestError());
            }
            else if (request && !requestError) {
                promise = promise.then(function (args) { return request.apply(void 0, args); });
            }
            else if (!request && requestError) {
                promise = promise.then(function (args) { return args; }, requestError());
            }
        });
        promise = promise.then(function (args) { return fetch.apply(void 0, args); });
        this.interceptArr.forEach(function (_a) {
            var response = _a.response, responseError = _a.responseError;
            if (response && responseError) {
                promise = promise.then(function (args) { return response.apply(void 0, args); }, function (args) { return responseError.apply(void 0, args); });
            }
            else if (response && !responseError) {
                promise = promise.then(function (args) {
                    return response(args);
                });
            }
            else if (!response && responseError) {
                promise = promise.then(function (args) { return args; }, function (e) { return responseError(e); });
            }
        });
        return promise;
    };
    return zFetchz;
}());
exports.default = zFetchz;
;
;
//# sourceMappingURL=zFetchz.js.map