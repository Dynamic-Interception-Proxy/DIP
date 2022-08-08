var _window = window;

export default function(window:any = _window) {

  delete window.navigator.serviceWorker;
  delete window.Navigator.prototype.serviceWorker;

  try {

    /*window.navigator.serviceWorker.register = new Proxy(window.navigator.serviceWorker.register, {
      apply(t, g, a) {
        if (a[0]) a[0] = '/dip/dip.swinject.js?url='+window.proxy.url.decode(window.proxy.url.encode(a[0]))
        if (a[1]&&a[1].scope) a[1].scope = window.proxy.url.encode(a[1].scope);
        else {
          if (!a[1]) {
            a[1] = {}
          }
          a[1].scope = window.proxy.url.encode(window.proxy.URL.origin);
        }

        if (a[1]&&a[1].scope) {
          if (!a[1].scope.endsWith('/')) a[1]+='/';
        }

        console.log(a)

        return Reflect.apply(t, g, a);
      }
    })*/

    var Nav = Object.getOwnPropertyDescriptor(window, 'navigator');
    
    const NavigatorOverride = Nav.get.call(this);

    //var ScriptURL = Object.getOwnPropertyDescriptor(window.ServiceWorker.prototype, 'scriptURL')

    /*Object.defineProperty(window.ServiceWorker.prototype, 'scriptURL', {
      get() {
        var url = ScriptURL.get.call(this);
        if (url==window.location.origin+'/service/worker.js'||url==window.location.origin+'/sw.js') return window.__DIP.location.origin

        if (new URLSearchParams(new URL(url).search).get('url')) return new URLSearchParams(new URL(url).search).get('url')
        
        return url;
      },
      set(val) {
        return val;
      }
    })*/

    //delete window.navigator;

    //var worker = Object.getOwnPropertyDescriptor(window.Navigator.prototype, 'serviceWorker');

    Object.defineProperty(window.navigator, 'userAgent', {
      get() {
        if (window.proxy.config.tab) {
          if (window.proxy.config.tab.ua) {
            return window.proxy.config.tab.ua
          }
        }
        return NavigatorOverride.userAgent;
      },
      set() {
        return arguments[0];
      }
    })
    
  } catch(e) {
    
  }
}