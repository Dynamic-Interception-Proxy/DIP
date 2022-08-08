var _window = window;

export default function(window:any = _window) {

  var domain = Object.getOwnPropertyDescriptor(window.Document.prototype, 'domain')

  try {  
      Object.defineProperty(window.document, 'baseURI', {
        get() {
          return window.__DIP.location.href;
        },
        set(val) {
          return val;
        }
      });

      Object.defineProperty(window.document, 'domain', {
        get() {
          return window.__DIP.location.hostname;
        },
        set(val) {
          return window.__DIP.location.hostname = val
        }
      });

      Object.defineProperty(window.document, 'documentURI', {
        get() {
          return window.__DIP.location.href;
        },
        set(val) {
          return val;
        }
      });

      Object.defineProperty(window.document, 'referrer', {
        get() {
          return window.proxy.meta.url.href;
        },
        set(val) {
          return val;
        }
      });
    
      Object.defineProperty(window.document, 'URL', {
        get() {
          return window.proxy.meta.url.href
        },
        set(val) {
          return val;
        }
      });
  } catch(e) {
    
  }
  
  window.Document.prototype.write = new Proxy(window.Document.prototype.write, {
    apply(t, g, a) {
      var regex = /(srcset|src|href|action|integrity|nonce|http-equiv)\s*=\s*['`"](.*?)['"`]/gi
      var text = a[0].toString()
      text = text.replace(regex, (match:any, p1:any, p2:any) => {
        if (p1=='integrity' || p1=='nonce' || p1=='http-equiv') return ''
        if (p1=='srcset') {
          const src_arr:any = [];
    
          p2.split(',').forEach((url:any) => {
            url = url.trimStart().split(' ');
            url[0] = window.proxy.url.encode(url[0], window.proxy.meta.url);
            src_arr.push(url.join(' '));
          });
    
          p2 = src_arr.join(', ')
          return `${p1}="${p2}"`
        }
        return `${p1}="${window.proxy.url.encode(p2, window.proxy.meta.url)}"`
      })

      a[0] = text

      return Reflect.apply(t, g, a)
    }
  })

  window.Element.prototype.insertAdjacentHTML = new Proxy(window.Element.prototype.insertAdjacentHTML, {
    apply(t, g, a) {
      var regex = /(srcset|src|href|action|integrity|nonce|http-equiv)\s*=\s*['`"](.*?)['"`]/gi
      var text = a[1].toString()
      text = text.replace(regex, (match:any, p1:any, p2:any) => {
        if (p1=='integrity' || p1=='nonce' || p1=='http-equiv') return ''
        if (p1=='srcset') {
          const src_arr:any = [];
    
          p2.split(',').forEach((url:any) => {
            url = url.trimStart().split(' ');
            url[0] = window.proxy.url.encode(url[0], window.proxy.meta.url);
            src_arr.push(url.join(' '));
          });
    
          p2 = src_arr.join(', ')
          return `${p1}="${p2}"`
        }
        return `${p1}="${window.proxy.url.encode(p2, window.proxy.meta.url)}"`
      })

      a[1] = text

      return Reflect.apply(t, g, a)
    }
  })

  window.Document.prototype.writeln = new Proxy(window.Document.prototype.writeln, {
    apply: (target, that, args) => {
      if (args.length) args = [ window.proxy.html.rewrite(args.join('')) ];
      return Reflect.apply(target, that, args);
    },
  });

  window.CSSStyleDeclaration.prototype.setProperty = new Proxy(window.CSSStyleDeclaration.prototype.setProperty, {
      apply: (target, that, args) => {
          if (args[1]) args[1] = window.proxy.css.rewrite(args[1], window.__DIP.location.href);
          return Reflect.apply(target, that, args);
      },
  });
}