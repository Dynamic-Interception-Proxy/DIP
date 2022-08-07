var _window = window

export default function (window: any = _window) {
  window.CSSStyleDeclaration.prototype.setProperty = new Proxy(window.CSSStyleDeclaration.prototype.setProperty, {
    apply: (target, that, args) => {
      if (args[1]) args[1] = window.proxy.css.rewrite(args[1], window.__DIP.location.href, {type: 'value'})
      return Reflect.apply(target, that, args);
    },
  });
}