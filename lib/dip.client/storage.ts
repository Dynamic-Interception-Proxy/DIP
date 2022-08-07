var _window = window;

export default function(window:any=_window) {
  try {
    const LocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
  
    var LStorageOverride = LocalStorage.get.call(this);
    delete window.localStorage;
    window.localStorage = new Proxy(LStorageOverride, {
      get(ob, prop:any) {
        if (prop=='getItem') {
          return function(key:any) {
            if ((!key)) return undefined;

            return LStorageOverride.getItem(window.__DIP.location.host+key)
          }
        }
        if (prop=='key') {
          return function(key:any) {
            var fakeArray:any = [];

            Object.entries(LStorageOverride).forEach(([e,v])=>{
              if (e.startsWith(window.__DIP.location.host)) {
                fakeArray.push(v);
              }
            })

            return fakeArray[key]
          }
        }
        if (prop=='length') {
            var fakeArray = [];

            Object.entries(LStorageOverride).forEach(([e,v])=>{
              if (e.startsWith(window.__DIP.location.host)) {
                fakeArray.push(e);
              }
            })

            return fakeArray.length
        }
        if (prop=='clear') {
          return function() {
            var fakeArray:any = [];

            Object.entries(LStorageOverride).forEach(([e,v])=>{
              if (e.startsWith(window.__DIP.location.host)) {
                fakeArray.push(e);
              }
            })

            fakeArray.forEach((key:any) => {
              console.log(Object.keys(LStorageOverride).indexOf(key))
              delete LStorageOverride[key];
            })
          }
        }
        if (prop=='setItem') {
          return function(key:any, value:any) {
            if ((!key)||(!value)) return undefined;

            console.log(window.proxy.meta.url.host)

            value+=''

            try {
              return LStorageOverride.setItem(window.__DIP.location.host+key, value)
            } catch {
              return undefined;
            }
          }
        }
        if (prop=='removeItem') {
          return function(key:any) {
            if ((!key)) return undefined;

            return LStorageOverride.removeItem(window.__DIP.location.host+key)
          }
        }
        if (LStorageOverride.getItem(window.__DIP.location.host+prop)) return ob[window.__DIP.location.host+prop];
      },
      set(ob, prop:any, value) {
        if (prop!=='getItem'||prop!=='setItem'||prop!=='removeItem') {
          try {
            return ob[window.__DIP.location.host+prop] = (value)
          } catch {
            return undefined;
          }
        }
      },
      deleteProperty(ob, prop:any) {
        return ob.removeItem(window.__DIP.location.host+prop)
      }
    })



    const SessionStorage = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
  
    var SStorageOverride = SessionStorage.get.call(this);
    
    delete window.sessionStorage;
    window.sessionStorage = new Proxy(SStorageOverride, {
      get(ob, prop:any) {
        if (prop=='getItem') {
          return function(key:any) {
            if ((!key)) return undefined;

            return SStorageOverride.getItem(window.__DIP.location.host+key)
          }
        }
        if (prop=='key') {
          return function(key:any) {
            var fakeArray:any = [];

            Object.entries(SStorageOverride).forEach(([e,v])=>{
              if (e.startsWith(window.__DIP.location.host)) {
                fakeArray.push(v);
              }
            })

            return fakeArray[key]
          }
        }
        if (prop=='length') {
            var fakeArray = [];

            Object.entries(SStorageOverride).forEach(([e,v])=>{
              if (e.startsWith(window.__DIP.location.host)) {
                fakeArray.push(e);
              }
            })

            return fakeArray.length
        }
        if (prop=='clear') {
          return function() {
            var fakeArray:any = [];

            Object.entries(SStorageOverride).forEach(([e,v])=>{
              if (e.startsWith(window.__DIP.location.host)) {
                fakeArray.push(e);
              }
            })

            fakeArray.forEach((key:any) => {
              console.log(Object.keys(SStorageOverride).indexOf(key))
              delete SStorageOverride[key];
            })
          }
        }
        if (prop=='setItem') {
          return function(key:any, value:any) {
            if ((!key)||(!value)) return undefined;

            return SStorageOverride.setItem(window.__DIP.location.host+key, value)
          }
        }
        if (prop=='removeItem') {
          return function(key:any) {
            if ((!key)) return undefined;

            return SStorageOverride.removeItem(window.__DIP.location.host+key)
          }
        }
        if (SStorageOverride.getItem(window.__DIP.location.host+prop)) return ob[window.__DIP.location.host+prop];
      },
      set(ob, prop:any, value:any) {
        if (prop!=='getItem'||prop!=='setItem'||prop!=='removeItem') {
          return ob[window.__DIP.location.host+prop] = value;
        }
      },
      deleteProperty(ob, prop:any) {
        return ob.removeItem(window.__DIP.location.host+prop)
      }
    })
  } catch(e) {
    
  }
}