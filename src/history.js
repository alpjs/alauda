import { basePath } from './index';
import EventEmitter from 'events';

let eventEmitter = new EventEmitter();

export function on(event, listener) {
    return eventEmitter.on(event, listener);
}

export function emit(...args) {
    return eventEmitter.emit(...args);
}

let started = false;

// Cached regex for stripping a leading hash/slash and trailing space.
let routeStripper = /^[#\/]|\s+$/g;

let _hasPushState = Boolean(window.history && window.history.pushState);
let usePushState;

const _getHash = function (windowOverride) {
    let match = (windowOverride || window).location.href.match(/#\/(.*)$/);
    return match ? match[1] : '';
};

const _cleanFragment = function (fragment) {
    fragment = fragment.replace(routeStripper, '');
    if ((`/${fragment}/`).startsWith(basePath)) {
        fragment = fragment.substr(basePath.replace(routeStripper, '').length);
    }
    return fragment;
};

const _updateHash = function (location, fragment, replace) {
    if (replace) {
        location.replace(`${location.toString().replace(/(javascript:|#).*$/, '')}#/${fragment}`);
    } else {
        location.hash = `/${fragment}`;
    }
};

let _checkUrlInterval; // eslint-disable-line no-unused-vars
let _currentFragment;
let _updateBrowserHistory;

export let getFragment;

export function start(forceUseHash) {
    if (started) {
        throw new Error(/* #if DEV */'history has already been started'/* #/if */);
    }
    started = true;
    usePushState = !forceUseHash && _hasPushState;

    if (usePushState) {
        getFragment = function () {
            let fragment = window.location.pathname;
            let search = window.location.search;
            if (search) {
                fragment += search;
            }
            return _cleanFragment(fragment);
        };

        _updateBrowserHistory = (fragment, replace) => {
            window.history[replace ? 'replaceState' : 'pushState'](
                {},
                document.title,
                `${window.location.protocol}//${window.location.host}${basePath}${fragment}`
            );
        };
    } else {
        getFragment = function () {
            let fragment = _getHash();
            return _cleanFragment(fragment);
        };

        _updateBrowserHistory = (fragment, replace) => {
            _updateHash(window.location, fragment, replace);
        };
    }

    let fragment = getFragment();

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
    let loc = window.location;

    // If we've started out with a hash-based route, but we're currently
    // in a browser where it could be `pushState`-based instead...
    if (usePushState && loc.hash && loc.pathname === '/') {
        _currentFragment = _getHash().replace(routeStripper, '');
        loc.hash = '';
        window.history.replaceState(
            { fragment: _currentFragment },
            document.title,
            `${loc.protocol}//${loc.host}${basePath}${_currentFragment}`
        );
        return false;
    }
    return usePushState || fragment === '';
}

// Checks the current URL to see if it has changed, and if it has, calls `loadUrl`
export function checkUrl() {
    let current = getFragment();
    if (current === _currentFragment) {
        return false;
    }

    loadUrl();
}

// Attempt to load the current URL fragment.
export function loadUrl() {
    _currentFragment = getFragment();
    let fragment = basePath + _currentFragment;
    if (fragment) {
        let a = document.querySelector(`a[href="${fragment}"]`);
        if (a) {
            a.click();
        } else {
            if (eventEmitter.emit('load', fragment) === false) {
                throw new Error('Missing listener for load event');
            }
        }
    }
}

export function navigate(fragment, replace) {
    fragment = (fragment || '');
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
