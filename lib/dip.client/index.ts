import HTMLRewriter from '../rewrite/html/index.ts';
import CSSRewriter from '../rewrite/css/index.ts';
import JSRewriter from '../rewrite/js/index.ts';
import DIPWindow from './window.ts';
import Message from './message.ts';
import History from './history.ts';
import Location from './location.ts';
import Navigator from './navigator.ts';
import Style from './style.ts';
import Http from './http.ts';
import Reflect from './reflect.ts';
import Encoding from '../encoding.ts';
import Storage from './storage.ts';
import { Element, Definer } from './element.ts';
import Url from '../rewrite/url.ts';
import Cookie from './cookie.ts';
import Ws from './ws.ts';
import Eval from './eval.ts';
import Document from './document.ts';
import { encodeProtocol, decodeProtocol } from './protocol.ts'

(function(window: any) {
  window.proxy = {}
  window.proxy.config = window.__DIP_config;

  let encoding;

  switch(window.proxy.config.encoding) {
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

  window.proxy.encodeURL = encoding.encode;
  window.proxy.decodeURL = encoding.decode;

  window.proxy.Location = Location;

  window.proxy.meta = new Object({});
  window.proxy.meta.url = new URL((window.proxy.decodeURL((location.pathname).split(window.proxy.config.prefix)[1])+(location.search+location.hash)))
  window.proxy.meta.origin = window.proxy.meta.url.origin;
  window.proxy.meta.host = window.proxy.meta.url.host;

  window.proxy.url = new Url(window.proxy)

  window.__DIP = Location(window.proxy.meta.url)

  DIPWindow(window);

  window.document.__DIP = window.__DIP

  if (window.proxy.config.tab) {
    if (window.proxy.config.tab.title) {
      try {
        document.title = window.proxy.config.tab.title;
        
        Object.defineProperty(document, 'title', {
          get() {
            return window.proxy.config.tab.title;
          },
          set(val) {
            return window.proxy.config.tab.title;
          }
        })
      } catch(e) {
        
      }
    }
  }

  window.proxy.html = new HTMLRewriter(window.proxy);
  window.proxy.js = new JSRewriter(window.proxy);
  window.proxy.css = new CSSRewriter(window.proxy);

  Element()
  Eval(window)
  Storage()
  Definer()
  Style()
  Document()
  Ws()
  Http(encodeProtocol, decodeProtocol, window)
  Message()
  Reflect()
  Cookie(window)
  Navigator()

  window.proxy.history = new History(window.proxy);

  ['pushState','replaceState'].forEach(e=>window.history[e]=new Proxy(window.history[e],window.proxy.history))

})(self||window);