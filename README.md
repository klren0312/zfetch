# zfetchz
fetch has timeout and interceptor; Doc: https://klren0312.github.io/zfetch/

[![NPM version][npm-image]][npm-url]
[![npm](https://img.shields.io/npm/dt/zfetchz.svg)](https://www.npmjs.com/package/zfetchz)

[npm-image]: https://img.shields.io/npm/v/zfetchz.svg?style=flat-square
[npm-url]: https://npmjs.org/package/zfetchz

## Install
```bash
$ npm install zfetchz --save
```

## Build
```bash
$ npm run build
```

## Test
```bash
$ npm run test
```

## Usage
1.Init
>If use it in Browser, you should use in browser' in first param; Else if you use it in NodeJS, you should use 'node' in first param.
>The second param is timeout, when you fetch data


```javascript
const zfetchz = new zfetchz('node', 2000);
```

2.config interceptor (Default no interceptor)
```javascript
const zfetchzInterceptor = zfetchz.interceptor;
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
```

3.If you want to unregister the interceptor, you should assign it to a variable, then call it
```javascript
const unregister = zfetchzInterceptor.register({
  request: function (...args: any[]) {
    return args;
  }
});

unregister();
```

4.Fetch data
```javascript
zfetchz.newFetch('https://www.zzes1314.cn', {
  mode: 'no-cors'
})
.then(function () {
});
```

