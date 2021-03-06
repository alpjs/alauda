/* global location */
import { basePath } from './index';
import { navigate, on } from './history';
import { init as initJsApp, ignoreUrl } from './js-app';

var _loadCallback = void 0;

export function init(loadCallback) {
  if (_loadCallback) throw new Error('already init');

  _loadCallback = loadCallback, initJsApp(), on('redirect', redirect);
}

export function redirect(url) {
  url && (ignoreUrl(url) ? location.href = url : load(url));
}

export function load(url) {
  url.startsWith('?') && (url = location.pathname + url), url.startsWith(basePath) && (url = url.substr(basePath.length)), navigate(url), _loadCallback('/' + url);
}
//# sourceMappingURL=web-app.js.map