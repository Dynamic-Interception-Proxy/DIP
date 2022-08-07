var _window = self||window;

export default function(window:any = _window) {
  var Eval = window.eval;

  /*window.__DIP.eval = new Proxy(window.eval, {
    apply(t, g, a) {
      if (!a.length || typeof a[0] !== 'string') return t.apply(g, a);

      a[0] = window.proxy.js.rewriteJS(a[0], {head: false})
      
      return Eval.call(g, a);
    }
  });

  Object.defineProperty(window.__DIP.window, 'eval', {
    configurable: true,
    get() {
      return this === window ? window.__DIP.eval : Eval;
    },
    set(val) {
      //this.eval = val;
    },
  })*/
}