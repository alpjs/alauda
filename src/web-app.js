import { basePath } from './index';
import { navigate } from './history';
import { init as initJsApp, ignoreLink, on } from './js-app';

let _loadCallback;

export function init(loadCallback) {
    if (_loadCallback) {
        throw new Error('already init');
    }

    _loadCallback = loadCallback;

    initJsApp();

    on('load', (url) => {
        if (url) {
            if (ignoreLink(url)) {
                window.location = url;
            } else {
                load(url);
            }
        }
    });
}

export function load(url) {
    if (url.startsWith('?')) {
        url = window.location.pathname + url;
    }

    if (url.startsWith(basePath)) {
        url = url.substr(basePath.length);
    }

    navigate(url);
    _loadCallback(`/${url}`);
}
