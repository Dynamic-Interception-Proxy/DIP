var _window = window

export default function(e:any, window:any = _window) {
    window.Location = (class Location{constructor() {}})
    if (!e) e = new URL(window.proxy.meta.url);
    var a = e;
    (window.__DIP?null:window.__DIP={}),window.__DIP.rawLocation=new Location(),window.__DIP.location = {},
      ["href", "host", "hash", "origin", "hostname", "port", "pathname", "protocol", "search"].forEach(t => {
        Object.defineProperty(window.__DIP.rawLocation, t, {
            get: () => "protocol" == t ? e[t] : "hash" == t ? window.location.hash||e[t] : e[t],
            set: e => "hash" == t ? window.location[t] = e : window.location[t] = window.proxy.url.encode(window.proxy.meta.url.href.replace(window.proxy.meta.url[t], e), a)
        })
    }), ["assign", "replace", "toString", "reload"].forEach(t => {
        Object.defineProperty(window.__DIP.rawLocation, t, {
            get: () => t=='toString'?()=>e['href']:new Function("arg", `return window.location.${t}(arg?${"reload"!==t&&"toString"!==t?"(self.proxy||self.__DIP).url.encode(arg, new URL('"+a.href+"'))":"arg"}:null)`),
            set: t => t
        })
    });
    window.__DIP.__defineSetter__('location', function(val:any) {
      if (val.toString()=='Location {}') return window.__DIP.rawLocation = val;

      window.__DIP.location.href = val;
    })
    window.__DIP.__defineGetter__('location', function() {
      return window.__DIP.rawLocation;
    })
    window.__DIP.AbsoluteURL = function(url:any) {
      return (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(url))
    }
    if (!window.__DIP.HashListener) {
      window.__DIP.HashListener = function(e:HashChangeEvent) {
        e.preventDefault();

        var Meta = window.proxy.url.decode(e.oldURL);
        var NewHash = new URL(e.newURL).hash;

        Meta.hash = NewHash;

        var NewURL = window.proxy.url.encode(Meta.href, window.proxy.meta);

        window.history.pushState(null, null, NewURL);

        window.proxy.Location(new URL(Meta))
      }

      window.addEventListener('hashchange', window.__DIP.HashListener);
    }
    window.document.__DIP = window.__DIP;
    return window.__DIP
}