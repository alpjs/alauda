/* global window, document */
/* eslint no-alert: 0 */
import { start as startHistory, redirectUrl, emit } from './history';

export function ignoreUrl(url, target) {
    return url.startsWith('#') || url.includes(':') || target && target.getAttribute('target');
}

export function init() {
    document.addEventListener('click', event => {
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
            if (ignoreUrl(url, currentTarget)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            var confirmMessage = currentTarget.getAttribute('data-confirm-message');
            if (confirmMessage && !window.confirm(confirmMessage)) {
                return false;
            }

            if (emit('redirect', url) === false) {
                throw new Error('Missing listener for redirect event');
            }

            return false;
        }
    }, false);

    if (!startHistory()) {
        // On older browsers, if the hash is different that the url, loads the new page according to the hash
        redirectUrl();
        return true;
    }
}
//# sourceMappingURL=js-app.js.map