'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFragment = undefined;
exports.on = on;
exports.emit = emit;
exports.start = start;
exports.checkUrl = checkUrl;
exports.loadUrl = loadUrl;
exports.navigate = navigate;

var _index = require('./index');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

/**
 * @function
 * @param obj
*/
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var eventEmitter = new _events2.default();

/**
 * @function
 * @param event
 * @param listener
*/function on(event, listener) {
    return eventEmitter.on(event, listener);
}

/**
 * @function
 * @param {...*} args
*/function emit() {
    return eventEmitter.emit.apply(eventEmitter, arguments);
}

var started = false;

// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

var _hasPushState = Boolean(window.history && window.history.pushState);
var usePushState = void 0;

var _getHash = /**
                * @function
                * @param windowOverride
               */function _getHash(windowOverride) {
    var match = (windowOverride || window).location.href.match(/#\/(.*)$/);
    return match ? match[1] : '';
};

var _cleanFragment = /**
                      * @function
                      * @param fragment
                     */function _cleanFragment(fragment) {
    fragment = fragment.replace(routeStripper, '');
    if (('/' + fragment + '/').startsWith(_index.basePath)) {
        fragment = fragment.substr(_index.basePath.replace(routeStripper, '').length);
    }
    return fragment;
};

var _updateHash = /**
                   * @function
                   * @param location
                   * @param fragment
                   * @param replace
                  */function _updateHash(location, fragment, replace) {
    if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#/' + fragment);
    } else {
        location.hash = '/' + fragment;
    }
};

var _checkUrlInterval = void 0; // eslint-disable-line no-unused-vars
var _currentFragment = void 0;
var _updateBrowserHistory = void 0;

var getFragment = exports.getFragment = void 0;

/**
 * @function
 * @param forceUseHash
*/function start(forceUseHash) {
    if (started) {
        throw new Error( /* #if DEV */'history has already been started' /* #/if */);
    }
    started = true;
    usePushState = !forceUseHash && _hasPushState;

    if (usePushState) {
        exports.getFragment = getFragment = /**
                                             * @function
                                            */function getFragment() {
            var fragment = window.location.pathname;
            var search = window.location.search;
            if (search) {
                fragment += search;
            }
            return _cleanFragment(fragment);
        };

        _updateBrowserHistory = function _updateBrowserHistory(fragment, replace) {
            window.history[replace ? 'replaceState' : 'pushState']({}, document.title, window.location.protocol + '//' + window.location.host + _index.basePath + fragment);
        };
    } else {
        exports.getFragment = getFragment = /**
                                             * @function
                                            */function getFragment() {
            var fragment = _getHash();
            return _cleanFragment(fragment);
        };

        _updateBrowserHistory = function _updateBrowserHistory(fragment, replace) {
            _updateHash(window.location, fragment, replace);
        };
    }

    var fragment = getFragment();

    // Depending on whether we're using pushState or hashes, and whether
    // 'onhashchange' is supported, determine how we check the URL state.
    if (usePushState) {
        window.addEventListener('popstate', checkUrl);
    } else if ('onhashchange' in window) {
        window.addEventListener('hashchange', checkUrl);
    } else {
        _checkUrlInterval = setInterval(checkUrl, 50);
    }

    // Determine if we need to change the base url, for a pushState link
    // opened by a non-pushState browser.
    _currentFragment = fragment;
    var loc = window.location;

    // If we've started out with a hash-based route, but we're currently
    // in a browser where it could be `pushState`-based instead...
    if (usePushState && loc.hash && loc.pathname === '/') {
        _currentFragment = _getHash().replace(routeStripper, '');
        loc.hash = '';
        window.history.replaceState({ fragment: _currentFragment }, document.title, loc.protocol + '//' + loc.host + _index.basePath + _currentFragment);
        return false;
    }
    return usePushState || fragment === '';
}

// Checks the current URL to see if it has changed, and if it has, calls `loadUrl`
/**
 * @function
*/function checkUrl() {
    var current = getFragment();
    if (current === _currentFragment) {
        return false;
    }

    loadUrl();
}

// Attempt to load the current URL fragment.
/**
 * @function
*/function loadUrl() {
    _currentFragment = getFragment();
    var fragment = _index.basePath + _currentFragment;
    if (fragment) {
        var a = document.querySelector('a[href="' + fragment + '"]');
        if (a) {
            a.click();
        } else {
            if (eventEmitter.emit('load', fragment) === false) {
                throw new Error('Missing listener for load event');
            }
        }
    }
}

/**
 * @function
 * @param fragment
 * @param replace
*/function navigate(fragment, replace) {
    fragment = fragment || '';
    fragment = _cleanFragment(fragment);

    if (fragment.charAt(0) === '?') {
        fragment = window.location.pathname + fragment;
        fragment = _cleanFragment(fragment);
    }

    if (_currentFragment == fragment) {
        return false;
    }

    eventEmitter.emit('changed', fragment);

    _currentFragment = fragment;
    _updateBrowserHistory(fragment, replace);
}
//# sourceMappingURL=history.js.map