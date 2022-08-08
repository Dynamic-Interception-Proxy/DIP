import HTMLRewriter from '../rewrite/html/index.ts'
import CSSRewriter from '../rewrite/css/index.ts'
import JSRewriter from '../rewrite/js/index.ts'
import URLRewriter from '../rewrite/url.ts';
import setCookie from 'set-cookie-parser';

import DynamicRequest from './Dynamic.ts';
import DIP from './dip.ts';

import HookEvent from '../event.ts';
import BareClient, { BareError } from '@tomphttp/bare-client';
import Encoding from '../encoding.ts';
import * as data from './data.ts';
const { defaultConfig, headerData } = data.default;
import * as cookies from '../cookie.ts';
const { validateCookie, getCookies, setCookies, db , serialize, idb } = cookies;
import * as path from 'path-browserify';

const __DIP: DIP = defaultConfig;

self.__DIP = __DIP;

__DIP.url = new URLRewriter(__DIP);
__DIP.html = new HTMLRewriter(__DIP);
__DIP.js = new JSRewriter(__DIP);
__DIP.css = new CSSRewriter(__DIP);

self.addEventListener('install', (event: Event) => {
  self.skipWaiting();
  console.log(`Dynamic Interception Proxy v${__DIP.version} Installed: ${__DIP.config.prefix}`);
})

self.addEventListener('activate', (event: any) => {
  event.waitUntil(clients.claim());
});

class DIPServiceWorker {
  CSP: any = {};
  blockList(list: String[] = [], page: string = '') {
    return this.on('request', function (event: HookEvent) {
      if (list.includes((event.data.url).hostname)) return event.respondWith(new Response(page, {status: 400}));
    });
  };
  async fetch({ request }:any) {
    if (!request) return false;
    if (!request.url.startsWith(location.origin+__DIP.config.prefix)) return fetch(request);
    if (request.url.startsWith(location.origin+'/dip/dip.')) return fetch(request)

    const Dynamic = new DynamicRequest(request, self.Bare);

    if (request.url.split('?')[1]) {
      var Meta = Dynamic.url.decode(request.url.split('?')[0]);

      var ResponseURL = Dynamic.url.encode(Meta.href+'?'+request.url.split('?')[1], Meta);

      return new Response(new Blob([Dynamic.html.generateRedirect(ResponseURL)]), {status: 301, statusText: 'Moved Permanently', headers: {Location: ResponseURL}})
    }

    request.meta = new Object({});

    Dynamic.cookie = {
      validateCookie,
      db: () => {
          return db(idb.openDB);
      },
      getCookies,
      setCookies,
      serialize,
      setCookie,
    };

    Dynamic.db = await Dynamic.cookie.db();

    try {
      request.meta.url = Dynamic.url.decode(request.url);
      request.meta.origin = request.meta.url.origin;
      request.meta.host = request.meta.url.host;
    } catch(e) {
      console.log(e);
      return new Response('Bad Url: '+request.url, {status: 400});
    }

    const BareHeaders = Object.fromEntries(request.headers.entries());

    request.meta.referrer = new String(request.meta.url);

    if (request.referrer) {
      try {
      request.meta.referrer = Dynamic.url.decode(request.referrer);
      } catch(e) {}
    }

    BareHeaders['referer'] = new String(request.meta.referrer);

    BareHeaders['host'] = new String(request.meta.host);
    BareHeaders['Host'] = new String(request.meta.host);
    BareHeaders['origin'] = new String(request.meta.origin);
    if (Dynamic.config.tab.ua) {
      BareHeaders['user-agent'] = new String(Dynamic.config.tab.ua);
    }

    const CookieStr: string = Dynamic.cookie.serialize(await Dynamic.cookie.getCookies(Dynamic.db), request.meta.url);

    if (request.mode == 'navigate' && request.destination == 'document') {BareHeaders['cookie'] = CookieStr};

    let FetchOptions: DynamicRequest = ({
      headers: (BareHeaders),
      method: request.method,
      redirect: 'manual',
    });

    if (headerData.body.indexOf(request.method.toUpperCase())==-1) FetchOptions.body = await request.blob();

    FetchOptions = new Dynamic.Request(new String(request.meta.url), new Object({...FetchOptions}));

    const Hooked = new HookEvent(FetchOptions);
    this.emit('request', Hooked);

    if (Hooked.intercepted) {
      return Hooked.returnValue;
    }

    const BareResponse = await Dynamic.Bare.fetch(FetchOptions.url, FetchOptions.init);

    for (const header in BareResponse.rawHeaders) {
        if (header.toLowerCase() === 'set-cookie') {
            await Dynamic.cookie.setCookies(BareResponse.rawHeaders[header], Dynamic.db, Dynamic.meta);
        }

        /*if (header.toLowerCase() === 'access-control-allow-origin') {
          console.log(BareResponse.rawHeaders[header], Dynamic.meta.url.href)
            var Check = !Dynamic.CORS(BareResponse.rawHeaders[header], new URL(Dynamic.meta.referrer).origin);

            if (Check) {
                console.error(`Access to fetch at '${Dynamic.meta.url.href}' from origin '${new URL(Dynamic.meta.referrer).origin}' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value '${BareResponse.rawHeaders[header]}' that is not equal to the supplied origin. Have the server send the header with a valid value, or, if an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.`);
                console.error((`${request.method} ${Dynamic.meta.url.href} net::ERR_FAILED 200`));
                console.error((`Uncaught (in promise) TypeError: Failed to fetch`))
                return Promise.reject(new Response(null, {status: headerData.status[0], headers: {}}));
            }
        }*/

        if (header.toLowerCase() === 'content-security-policy') {
            var Parsed = Dynamic.CSP(BareResponse.rawHeaders[header])

            this.CSP[Dynamic.meta.host] = Parsed;
        }
    }

    /*if (this.CSP[new URL(Dynamic.meta.referrer).hostname]) {
      var data = this.CSP[new URL(Dynamic.meta.referrer).hostname];

      for (let [name, [destinations, fallbacks]] of Object.entries(headerData.cspData)) {

        if (destinations.indexOf(request.destination)!==-1) {
          var object = headerData.cspData[name];

          var Check = !Dynamic.CSPMatch(object, new URL(Dynamic.meta.referrer), Dynamic.meta.url, data[name]);

          if (Check) {
            console.error(`[CSP] Refused to load the ${request.destination} '${Dynamic.meta.url.href}' because it violates the following Content Security Policy directive: '${data[name]}'`);
            return Promise.reject(new Response(null, {status: headerData.status[0], headers: {}}));
          }
        }
      }
    }*/

    if (BareResponse.rawHeaders['location']||BareResponse.rawHeaders['Location']) {
      const LocationValue = BareResponse.rawHeaders['location']||BareResponse.rawHeaders['Location'];
      console.log(LocationValue);
      delete BareResponse.rawHeaders['location'];
      delete BareResponse.rawHeaders['Location'];
      BareResponse.rawHeaders['location'] = Dynamic.url.encode(new URL(LocationValue, String(request.meta.url)), request.meta.url)
    }

    const ResponseHeaders: Headers = new Headers(BareResponse.rawHeaders);

    [...headerData.csp].forEach(e=>
      ResponseHeaders
        .delete(e)
    );

    const ResponseOptions = {
      headers: ResponseHeaders,
      status: BareResponse.status,
      statusText: BareResponse.statusText,
    }

    var ResponseBody: Boolean | Blob | String = false;


    switch(request.destination) {
      case 'worker':
      case 'script':
        Dynamic.isJS = Dynamic.isJs(request.meta.url, ResponseHeaders.get('content-type'));

        if (Dynamic.isJS)
          ResponseBody = Dynamic.js.rewriteJS(await BareResponse.text(), {module: false, head: true, destination: request.destination});
        break;
      case 'style':
        Dynamic.isCSS = Dynamic.isCss(request.meta.url, ResponseHeaders.get('content-type'));

        if (Dynamic.isCSS)
          ResponseBody = Dynamic.css.rewrite(await BareResponse.text(), request.meta.url);
        break;
      case 'document': 
        const ResponseBlob = await BareResponse.blob();
        const ResponseText = await ResponseBlob.text();

        Dynamic.isHTML = Dynamic.isHtml(request.meta.url, ResponseHeaders.get('content-type'), ResponseText);

        if (Dynamic.isHTML)
          ResponseBody = new Blob([Dynamic.html.rewrite(ResponseText, btoa(Dynamic.cookie.serialize(await Dynamic.cookie.getCookies(Dynamic.db), request.meta.url)), Dynamic.meta)]);
        else
          ResponseBody = ResponseBlob;
        break;
      case 'iframe':
        Dynamic.isHTML = Dynamic.isHtml(request.meta.url, ResponseHeaders.get('content-type'));

        if (Dynamic.isHTML)
          ResponseBody = new Blob([Dynamic.html.rewrite(await BareResponse.text(), btoa(Dynamic.cookie.serialize(await Dynamic.cookie.getCookies(Dynamic.db), request.meta.url)), Dynamic.meta)]);
        break;
      default:
        //console.log(request.destination, Dynamic.meta.url.href)
        break;
    }

    if (BareHeaders['accept'] === 'text/event-stream') {
      ResponseOptions.headers.set('content-type', 'text/event-stream')
    };

    if (headerData.status.indexOf(parseInt(ResponseOptions.status))>-1) {
      ResponseBody = undefined;
    }

    return new Response(ResponseBody==false?await BareResponse.blob():ResponseBody, ResponseOptions);
  }

  constructor(url: String | URL) {

    self.importScripts(path.dirname(url)+'/dip.config.js')

    if (!__DIP.config.bare.path.startsWith('http')) __DIP.config.bare.path = location.origin+__DIP.config.bare.path;

    self.Bare = new BareClient(__DIP.config.bare.path);

    let encoding;
    
    switch(__DIP.config.encoding) {
      case "xor":
        encoding = Encoding.xor;
        break;
      case "plain":
        encoding = Encoding.plain;
        break;
      case "base64":
        encoding = Encoding.base64;
        break;
      case "shuffle":
      default:
        encoding = Encoding.plain;
        break;
    }

    __DIP.encodeURL = encoding.encode;
    __DIP.decodeURL = encoding.decode;

    __DIP.url.proxy = __DIP;
  }

  listeners = {};

  on(event: String|Number, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback)
  }

  emit(event: String, data: String | Object | Request) {
    if (this.listeners[event]) this.listeners[event].forEach((e:Function)=>e(data))
  }
}

self.DIPServiceWorker = DIPServiceWorker;