# alauda [![NPM version][npm-image]][npm-url]

tools for webapps

[![Dependency Status][daviddm-image]][daviddm-url]


## Install

```sh
npm install --save alauda
```

## Usage

### History

```js
import { on, start, navigate } from 'alauda/history';

start(); // start listening for history changes

// listen for history changes
on('redirect', function(url) {
    console.log(url);
});

// example with ga
on('changed', function(url) {
    _gaq.push(['_trackPageview', url]);
})

navigate('/'); // indicate to the browser to change url
navigate('/', true); // indicate to the browser to change url by replacing the current one
```

### Web app

Use history to navigate and redirect


```js
import { init, redirect } from 'alauda/web-app';

init((url) => {
    console.log(url);
});

redirect('/'); // manually ask for a redirect of url
```



[npm-image]: https://img.shields.io/npm/v/alauda.svg?style=flat-square
[npm-url]: https://npmjs.org/package/alauda
[daviddm-image]: https://david-dm.org//alauda.svg?style=flat-square
[daviddm-url]: https://david-dm.org//alauda
