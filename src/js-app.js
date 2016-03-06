/* eslint no-alert: 0 */
import { start as startHistory, loadUrl, emit } from './history';
export { on } from './history';

export function ignoreLink(url, target) {
    return url.startsWith('#') || url.includes(':') || (target && target.getAttribute('target'));
}

export function init() {
    document.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey) {
            return;
        }

        let element = document;
        let currentTarget = event.target;

        for (; currentTarget !== element; currentTarget = currentTarget.parentNode || element) {
            // Don't process clicks on disabled elements
            if (currentTarget.disabled === true) {
                continue;
            }

            if (!currentTarget.matches('a[href],[data-href]')) {
                continue;
            }

            let url = currentTarget.getAttribute('href') || currentTarget.getAttribute('data-href');
            if (ignoreLink(url, currentTarget)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            let confirmMessage = currentTarget.getAttribute('data-confirm-message');
            if (confirmMessage && !window.confirm(confirmMessage)) {
                return false;
            }

            if (emit('load', url) === false) {
                throw new Error('Missing listener for load event');
            }

            return false;
        }
    }, false);

    if (!startHistory()) {
        // On older browsers, if the hash is different that the url, loads the new page according to the hash
        loadUrl();
        return true;
    }
}
