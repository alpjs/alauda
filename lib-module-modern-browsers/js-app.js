/* global window, document */
/* eslint no-alert: 0 */
import { start as startHistory, redirectUrl, emit } from './history';

export function ignoreUrl(url, target) {
  return url.startsWith('#') || url.includes(':') || target && target.getAttribute('target');
}

export function init() {

  if (document.addEventListener('click', function (event) {
    if (!(event.ctrlKey || event.metaKey)) {

        let element = document;


        for (let currentTarget = event.target; currentTarget !== element; currentTarget = currentTarget.parentNode || element) {
          // Don't process clicks on disabled elements
          if (currentTarget.disabled === true) continue;

          if (!currentTarget.matches('a[href],[data-href]')) continue;

          let url = currentTarget.getAttribute('href') || currentTarget.getAttribute('data-href');
          if (ignoreUrl(url, currentTarget)) return;

          event.preventDefault(), event.stopPropagation();


          let confirmMessage = currentTarget.getAttribute('data-confirm-message');
          if (confirmMessage && !window.confirm(confirmMessage)) return false;

          if (emit('redirect', url) === false) throw new Error('Missing listener for redirect event');

          return false;
        }
      }
  }, false), !startHistory()) return redirectUrl(), true;
}
//# sourceMappingURL=js-app.js.map