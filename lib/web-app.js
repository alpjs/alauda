'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.init = init;
exports.load = load;

var _index = require('./index');

var _history = require('./history');

var _jsApp = require('./js-app');

var _loadCallback = void 0;

/**
 * @function
 * @param loadCallback
*/function init(loadCallback) {
    if (_loadCallback) {
        throw new Error('already init');
    }

    _loadCallback = loadCallback;

    (0, _jsApp.init)();

    (0, _jsApp.on)('load', function (url) {
        if (url) {
            if ((0, _jsApp.ignoreLink)(url)) {
                window.location = url;
            } else {
                load(url);
            }
        }
    });
}

/**
 * @function
 * @param url
*/function load(url) {
    if (url.startsWith('?')) {
        url = window.location.pathname + url;
    }

    if (url.startsWith(_index.basePath)) {
        url = url.substr(_index.basePath.length);
    }

    (0, _history.navigate)(url);
    _loadCallback('/' + url);
}
//# sourceMappingURL=web-app.js.map