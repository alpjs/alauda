/* global window, location, document, history */
import EventEmitter from 'events';
import { basePath } from './index';

let eventEmitter = new EventEmitter();

export function on(event, listener) {
  return eventEmitter.on(event, listener);
}

export function emit(...args) {
  return eventEmitter.emit(...args);
}

let started = false;

// Cached regex for stripping a leading hash/slash and trailing space.
let routeStripper = /^[#/]|\s+$/g;

let _hasPushState = Boolean(window.history && history.pushState);
let usePushState;

const _getHash = function _getHash(windowOverride) {
  let match = (windowOverride || window).location.href.match(/#\/(.*)$/);
  return match ? match[1] : '';
};

const _cleanFragment = function _cleanFragment(fragment) {
  return fragment = fragment.replace(routeStripper, ''), `/${fragment}/`.startsWith(basePath) && (fragment = fragment.substr(basePath.replace(routeStripper, '').length)), fragment;
};

const _updateHash = function _updateHash(location, fragment, replace) {
  replace ? location.replace(`${location.toString().replace(/(javascript:|#).*$/, '')}#/${fragment}`) : location.hash = `/${fragment}`;
};

let _checkUrlInterval; // eslint-disable-line no-unused-vars
let _currentFragment;
let _updateBrowserHistory;

// eslint-disable-next-line import/no-mutable-exports
export let getFragment;

export function start(forceUseHash) {
  if (started) throw new Error( /* #if DEV */'history has already been started' /* #/if */);
  started = true, usePushState = !forceUseHash && _hasPushState, usePushState ? (getFragment = function getFragment() {
    let fragment = location.pathname;
    let search = location.search;

    return search && (fragment += search), _cleanFragment(fragment);
  }, _updateBrowserHistory = function _updateBrowserHistory(fragment, replace) {
    history[replace ? 'replaceState' : 'pushState']({}, document.title, `${location.protocol}//${location.host}${basePath}${fragment}`);
  }) : (getFragment = function getFragment() {
    let fragment = _getHash();
    return _cleanFragment(fragment);
  }, _updateBrowserHistory = function _updateBrowserHistory(fragment, replace) {
    _updateHash(location, fragment, replace);
  });


  let fragment = getFragment();

  // Depending on whether we're using pushState or hashes, and whether
  // 'onhashchange' is supported, determine how we check the URL state.
  usePushState ? window.addEventListener('popstate', checkUrl) : 'onhashchange' in window ? window.addEventListener('hashchange', checkUrl) : _checkUrlInterval = setInterval(checkUrl, 50), _currentFragment = fragment;

  let loc = location;

  // If we've started out with a hash-based route, but we're currently
  // in a browser where it could be `pushState`-based instead...
  return usePushState && loc.hash && loc.pathname === '/' ? (_currentFragment = _getHash().replace(routeStripper, ''), loc.hash = '', history.replaceState({ fragment: _currentFragment }, document.title, `${loc.protocol}//${loc.host}${basePath}${_currentFragment}`), false) : usePushState || fragment === '';
}

// Checks the current URL to see if it has changed, and if it has, calls `redirectUrl`
export function checkUrl() {
  let current = getFragment();
  return current !== _currentFragment && void redirectUrl();
}

// Attempt to load the current URL fragment.
export function redirectUrl() {
  _currentFragment = getFragment();

  let fragment = basePath + _currentFragment;
  if (fragment) {
    let a = document.querySelector(`a[href="${fragment}"]`);
    if (a) a.click();else if (eventEmitter.emit('redirect', fragment) === false) throw new Error('Missing listener for redirect event');
  }
}

export function navigate(fragment, replace) {
  return fragment = fragment || '', fragment = _cleanFragment(fragment), fragment.charAt(0) === '?' && (fragment = location.pathname + fragment, fragment = _cleanFragment(fragment)), _currentFragment !== fragment && void (eventEmitter.emit('changed', fragment), _currentFragment = fragment, _updateBrowserHistory(fragment, replace));
}
//# sourceMappingURL=history.js.map