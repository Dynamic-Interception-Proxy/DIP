import setCookie from 'set-cookie-parser';
import * as Cookie from '../cookie.ts'

export default async function(window: any = {}) {
  if (!window.__DIP) return;
  window.__DIP.db = await Cookie.db(Cookie.idb.openDB);
  window.__DIP.cookieStr = ((window.__DIP_config||{}).cookie||'');

  //console.log(window.__DIP_config.cookie)

  console.log(window.__DIP.location.href)

  //const Navigator: Object = window.navigator;

  /*if ('serviceWorker' in Navigator) Navigator.serviceWorker.addEventListener('message', async (event: MessageEvent) => {
    if (event.data.msg == 'updateCookies') {
      console.log(window.__DIP.location.host, new URL(event.data.url).host)
      if (new URL(event.data.url).host !== window.__DIP.location.host) return false;
      var Cookies = await Cookie.getCookies(window.__DIP.db);
      return window.__DIP.cookieStr = Cookie.serialize(Cookies, new URL(event.data.url));
    }
  });*/

  Object.defineProperty(window.Document.prototype, 'cookie', {
    get() {
      return window.__DIP.cookieStr
    },
    set(val: String) {
      Promise.resolve(Cookie.setCookies(val, window.__DIP.db, window.__DIP.location)).then(async () => {
          var db = await Cookie.db(Cookie.idb.openDB);
          var cookies = await Cookie.getCookies(db)
          window.__DIP.cookieStr = Cookie.serialize(cookies, window.__DIP.location, true);
      });

      const cookie = setCookie(val)[0];

      if (!cookie.path) cookie.path = '/';
      if (!cookie.domain) cookie.domain = window.__DIP.location.host;

      if (Cookie.validateCookie(cookie, window.__DIP.location, true)) {
          if (window.__DIP.cookieStr.length) window.__DIP.cookieStr += '; ';
          window.__DIP.cookieStr += `${cookie.name}=${cookie.value}`;
      };
    }
  })
};