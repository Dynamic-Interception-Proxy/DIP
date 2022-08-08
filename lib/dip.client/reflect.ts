var _window = self||window;

export default function(window:any = _window) {
  window._ReflectGet = window.Reflect.get;
  window._ReflectSet = window.Reflect.set;

  window.Reflect.get = new Proxy(window.Reflect.get, {
    apply(t, g, a) {
      var obj = a[0];
      var prop = a[1];

      var ObjWindow = obj?.window?.self?.globalThis !== undefined;

      if (obj instanceof window.Location) obj = window.__DIP.location;
      //if (ObjWindow) obj = obj.__DIP.window;

      return obj[prop];
    }
  })

  window.Reflect.set = new Proxy(window.Reflect.set, {
    apply(t, g, a) {
      var obj = a[0];
      var prop = a[1];
      var value = a[2];

      if (obj==window) obj = window.__DIP.window;
      if (prop=='location') obj = window.__DIP.location;
    }
  })
};