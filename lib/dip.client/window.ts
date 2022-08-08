var _window = self||window;

export default function(window: any = _window) {
  window.__DIP.window = new Proxy(window, {
    get(obj, prop) {
      if (prop=='location') return window.__DIP.location;
      if (prop=='top') return window.top.__DIP.window;
      if (prop=='parent') return window.parent.__DIP.window;

      return window._ReflectGet(window, prop);
    },
    set(obj, prop, value) {
      window[prop] = value;

      return !value?true:value;
    }
  })
}