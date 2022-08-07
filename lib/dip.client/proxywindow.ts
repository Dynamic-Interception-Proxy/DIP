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

var _window = self||window;

export default function(win: any, window: any = _window) {
  
  win.proxy = {}
  win.proxy.config = window.__DIP_config;

  let encoding;
  
  switch(win.proxy.config.encoding) {
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
  
  win.proxy.encodeURL = encoding.encode;
  win.proxy.decodeURL = encoding.decode;
  
  win.proxy.Location = Location;

  win.proxy.meta = new Object({});
  try {
    win.proxy.meta.url = new URL((win.proxy.decodeURL((win.location.pathname).split(win.proxy.config.prefix)[1])+(win.location.search+win.location.hash)))
  } catch(e) {
    win.proxy.meta.url = new URL((window.proxy.decodeURL((window.location.pathname).split(window.proxy.config.prefix)[1])+(window.location.search+window.location.hash)))
  }
  win.proxy.meta.origin = win.proxy.meta.url.origin;
  win.proxy.meta.host = win.proxy.meta.url.host;

  win.proxy.url = new Url(win.proxy)

  var history = new History(win.proxy);
  
  win.__DIP = Location(win.proxy.meta.url, win)

  DIPWindow(win)
  
  win.document.__DIP = win.__DIP

  if (window.proxy.config.tab) {
    if (window.proxy.config.tab.title) {
      try {
        win.document.title = window.proxy.config.tab.title;
        
        Object.defineProperty(win.document, 'title', {
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

  win.proxy.html = new HTMLRewriter(win.proxy);
  win.proxy.js = new JSRewriter(win.proxy);
  
  Element(win)
  Eval(win)
  Storage(win)
  Definer(win)
  Style()
  Document(win)
  Ws(win)
  Http(encodeProtocol, decodeProtocol, win)
  Message(win)
  Reflect(win)
  Cookie(win)
  Navigator(win)

  win.proxy.history = new History(win.proxy);
  
  ['pushState','replaceState'].map(e=>win.history[e]=new Proxy(win.history[e],win.proxy.history))

  return win
}