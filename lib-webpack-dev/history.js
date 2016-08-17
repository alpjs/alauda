/* global window, location, document, history */
import EventEmitter from 'events';
import { basePath } from './index';

var eventEmitter = new EventEmitter();

export function on(event, listener) {
    return eventEmitter.on(event, listener);
}

export function emit() {
    return eventEmitter.emit.apply(eventEmitter, arguments);
}

var started = false;

// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

var _hasPushState = Boolean(window.history && history.pushState);
var usePushState = undefined;

var _getHash = function _getHash(windowOverride) {
    var match = (windowOverride || window).location.href.match(/#\/(.*)$/);
    return match ? match[1] : '';
};

var _cleanFragment = function _cleanFragment(fragment) {
    fragment = fragment.replace(routeStripper, '');
    if (('/' + fragment + '/').startsWith(basePath)) {
        fragment = fragment.substr(basePath.replace(routeStripper, '').length);
    }
    return fragment;
};

var _updateHash = function _updateHash(location, fragment, replace) {
    if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#/' + fragment);
    } else {
        location.hash = '/' + fragment;
    }
};

var _checkUrlInterval = undefined; // eslint-disable-line no-unused-vars
var _currentFragment = undefined;
var _updateBrowserHistory = undefined;

// eslint-disable-next-line import/no-mutable-exports
export var getFragment = undefined;

export function start(forceUseHash) {
    if (started) {
        throw new Error( /* #if DEV */'history has already been started' /* #/if */);
    }
    started = true;
    usePushState = !forceUseHash && _hasPushState;

    if (usePushState) {
        getFragment = function getFragment() {
            var fragment = location.pathname;
            var search = location.search;
            if (search) {
                fragment += search;
            }
            return _cleanFragment(fragment);
        };

        _updateBrowserHistory = function _updateBrowserHistory(fragment, replace) {
            history[replace ? 'replaceState' : 'pushState']({}, document.title, location.protocol + '//' + location.host + basePath + fragment);
        };
    } else {
        getFragment = function getFragment() {
            var fragment = _getHash();
            return _cleanFragment(fragment);
        };

        _updateBrowserHistory = function _updateBrowserHistory(fragment, replace) {
            _updateHash(location, fragment, replace);
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
    var loc = location;

    // If we've started out with a hash-based route, but we're currently
    // in a browser where it could be `pushState`-based instead...
    if (usePushState && loc.hash && loc.pathname === '/') {
        _currentFragment = _getHash().replace(routeStripper, '');
        loc.hash = '';
        history.replaceState({ fragment: _currentFragment }, document.title, loc.protocol + '//' + loc.host + basePath + _currentFragment);
        return false;
    }
    return usePushState || fragment === '';
}

// Checks the current URL to see if it has changed, and if it has, calls `redirectUrl`
export function checkUrl() {
    var current = getFragment();
    if (current === _currentFragment) {
        return false;
    }

    redirectUrl();
}

// Attempt to load the current URL fragment.
export function redirectUrl() {
    _currentFragment = getFragment();
    var fragment = basePath + _currentFragment;
    if (fragment) {
        var a = document.querySelector('a[href="' + fragment + '"]');
        if (a) {
            a.click();
        } else if (eventEmitter.emit('redirect', fragment) === false) {
            throw new Error('Missing listener for redirect event');
        }
    }
}

export function navigate(fragment, replace) {
    fragment = fragment || '';
    fragment = _cleanFragment(fragment);

    if (fragment.charAt(0) === '?') {
        fragment = location.pathname + fragment;
        fragment = _cleanFragment(fragment);
    }

    if (_currentFragment === fragment) {
        return false;
    }

    eventEmitter.emit('changed', fragment);

    _currentFragment = fragment;
    _updateBrowserHistory(fragment, replace);
}
//# sourceMappingURL=history.js.map