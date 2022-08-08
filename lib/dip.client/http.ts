import JSRewriter from '../rewrite/js/index.ts';
import Message from '../message.ts';
import WrapWindow from './proxywindow.ts';

var _window = window;

export default function(encode_protocol:Function, decode_protocol:Function, window:any = _window) {

    const ResponseURL = Object.getOwnPropertyDescriptor(window.Object.prototype, 'url');

    try {
      
      Object.defineProperty(window, 'origin', {
        get() {
          return window.__DIP.location.origin
        },
        set() {
          return arguments[0]
        }
      })
    } catch(e) {
      
    }
  
    var ProcessJS = (new JSRewriter(window.proxy)).rewrite

    var XHR = window.XMLHttpRequest

    window.XMLHttpRequest.prototype.open = new Proxy(window.XMLHttpRequest.prototype.open, {
        apply(t, g, a) {
            if (a[1]) a[1] = window.proxy.url.encode(a[1], window.proxy.meta.url)
            return Reflect.apply(t, g, a)
        }
    })
    
    window.fetch = new Proxy(window.fetch, {
        apply(t, g, a) {
            if (a[0] instanceof window.Request) return Reflect.apply(t, g, a);
            if (a[0]) a[0] = window.proxy.url.encode(a[0], window.proxy.meta.url)
            return Reflect.apply(t, g, a)
        }
    })

    Object.defineProperty(window.Request.prototype, 'url', {
      get() {
        return this.__DIP$url;
      },
      set(val) {
        return false;
      }
    })

    Object.defineProperty(window.Response.prototype, 'url', {
      get() {
        return window.proxy.url.decode(ResponseURL.get.call(this));
      },
      set(val) {
        return false;
      }
    })
    
    window.Request = new Proxy(window.Request, {
        construct(t, a) {
            var url = a[0]+'';
            if (!window.__DIP.AbsoluteURL(url)) url = String(window.proxy.url.decode(window.proxy.url.encode(url, window.proxy.meta.url)));

            if (a[0]) a[0] = window.proxy.url.encode(a[0], window.proxy.meta.url);
            var req = Reflect.construct(t, a);

            req.__DIP$url = url;

            return req;
        }
    });

    window.Worker = new Proxy(window.Worker, {
        construct: (target, args) => {
          if (args[0])  {
            args[0] = args[0].toString();
              if (args[0].trim().startsWith(`blob:${window.__DIP.location.origin}`)) {
                  const xhr = new XHR;
                  xhr.open('GET', args[0], false);
                  xhr.send();
                  const script = ProcessJS(xhr.responseText);
                  const blob = new Blob([ script ], { type: 'application/javascript' });
                  args[0] = URL.createObjectURL(blob);
              } else {
                  args[0] = window.proxy.url.encode(args[0], window.proxy.meta.url);
              };
            };
            window.__DIP.worker = Reflect.construct(target, args);
            return window.__DIP.worker
        },
    }); 

    window.Navigator.prototype.sendBeacon = new Proxy(window.Navigator.prototype.sendBeacon, {
        apply(t, g, a) {
            if (a[0]) a[0] = window.proxy.url.encode(a[0], window.proxy.meta.url)
            return Reflect.apply(t, g, a);
        }
    })

    window.open = new Proxy(window.open, {
      apply(t, g, a) {
        if (a[0]) a[0] = window.proxy.url.encode(a[0], window.proxy.meta.url);
        return WrapWindow(Reflect.apply(t, g, a));
      }
    })
}