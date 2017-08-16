/* global window, document */
/* eslint no-alert: 0 */
import { start as startHistory, redirectUrl, emit } from './history';

export function ignoreUrl(url, target) {
  return url.startsWith('#') || url.includes(':') || target && target.getAttribute('target');
}

export function init() {

  if (document.addEventListener('click', function (event) {
    if (!(event.ctrlKey || event.metaKey)) {

        var element = document;


        for (var _currentTarget = event.target; _currentTarget !== element; _currentTarget = _currentTarget.parentNode || element)
        // Don't process clicks on disabled elements
        if (_currentTarget.disabled !== true && _currentTarget.matches('a[href],[data-href]')) {

            var url = _currentTarget.getAttribute('href') || _currentTarget.getAttribute('data-href');
            if (ignoreUrl(url, _currentTarget)) return;

            event.preventDefault(), event.stopPropagation();


            var confirmMessage = _currentTarget.getAttribute('data-confirm-message');
            if (confirmMessage && !window.confirm(confirmMessage)) return false;

            if (emit('redirect', url) === false) throw new Error('Missing listener for redirect event');

            return false;
          }
      }
  }, false), !startHistory()) return redirectUrl(), true;
}
//# sourceMappingURL=js-app.js.map