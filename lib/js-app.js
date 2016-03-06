'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.on = undefined;

var _history = require('./history');

Object.defineProperty(exports, 'on', {
    enumerable: true,
    get: /**
          * @function
         */function get() {
        return _history.on;
    }
});
exports.ignoreLink = ignoreLink;
exports.init = init;
/**
 * @function
 * @param url
 * @param target
*/function ignoreLink(url, target) {
    return url.startsWith('#') || url.includes(':') || target && target.getAttribute('target');
}

/**
 * @function
*/function init() {
    document.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey) {
            return;
        }

        var element = document;
        var currentTarget = event.target;

        for (; currentTarget !== element; currentTarget = currentTarget.parentNode || element) {
            // Don't process clicks on disabled elements
            if (currentTarget.disabled === true) {
                continue;
            }

            if (!currentTarget.matches('a[href],[data-href]')) {
                continue;
            }

            var url = currentTarget.getAttribute('href') || currentTarget.getAttribute('data-href');
            if (ignoreLink(url, currentTarget)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            var confirmMessage = currentTarget.getAttribute('data-confirm-message');
            if (confirmMessage && !window.confirm(confirmMessage)) {
                return false;
            }

            if ((0, _history.emit)('load', url) === false) {
                throw new Error('Missing listener for load event');
            }

            return false;
        }
    }, false);

    if (!(0, _history.start)()) {
        // On older browsers, if the hash is different that the url, loads the new page according to the hash
        (0, _history.loadUrl)();
        return true;
    }
}
//# sourceMappingURL=js-app.js.map