# alauda

tools for webapps

## History

```js
import { on, start, navigate } from 'alauda/history';

start(); // start listening for history changes

// listen for history changes
on('load', function(url) {
    console.log(url);
});

// example with ga
on('changed', function(url) {
    _gaq.push(['_trackPageview', url]);
})

navigate('/'); // indicate to the browser to change url
navigate('/', true); // indicate to the browser to change url by replacing the current one
```

## Web app

Use history to navigate and load


```js
import { init, load } from 'alauda/web-app';

init((url) => {
    console.log(url);
});

load('/'); // manually ask for a load of url
```

