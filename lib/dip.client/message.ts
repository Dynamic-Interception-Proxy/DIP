var _window = self||window

export default function(window:any = _window) {
  window.__DIP.message = function(target = window) {
    return function() {
      if (target instanceof (target.MessagePort||class{})||target instanceof (window.MessagePort||class{})) return target.postMessage(...arguments);
      
      var origin = '*';
      var ports = false;
      var portArg = undefined;
      var noOrigin = false;
      if (Array.isArray(arguments[2])&&(JSON.stringify(arguments[2].map(e=>e instanceof window.MessagePort))==JSON.stringify(arguments[2].map(e=>true)))) ports = true;
      if (target instanceof window.MessagePort) {noOrigin = true; origin = undefined;};
      if (target instanceof window.Worker) {noOrigin = true; origin = undefined;};
      if (target instanceof (window.DedicatedWorkerGlobalScope||class{})) {
        origin = undefined;
        noOrigin = true;
      };

      if (noOrigin&&ports) origin = arguments[2];
      if (ports) portArg = arguments[2];

      var finalArgs = [];

      finalArgs.push({data: arguments[0], __origin: arguments[1]});
      if (origin) finalArgs.push(origin);
      if (portArg) finalArgs.push(portArg);


      return target.postMessage(...finalArgs);
    }
  }

  class MessageEvent {
    message = {origin: '*', data: null};
    
    constructor(event:any) {
      for (var entry in (event)) {
        if (entry == 'data'&&!event[entry].__origin) event[entry].__origin = ''; 
        if (entry!=='origin') this[entry] = event[entry];
      }
    }
  
    get origin() {
      return this.message.origin;
    }
    set origin(val) {
      this.message.origin = val;
    }
  
    get data() {
      return this.message.data
    }
    set data(val) {
      if (val.__origin!==undefined&&val.data) {
        this.message.origin = val.__origin;
        this.message.data = val.data;
      }
      if (val.__origin!==undefined&&val.data) val = val.data;
      this.message.data = val;
    }
  }
  
  Object.defineProperty(window, 'onmessage', {
    get() {
      return window.messageListener;
    },
    set(val) {
      if (window.messageListener) window.removeEventListener('message', window.messageListener);
      window.messageListener = val;
      window.addEventListener('message', val);
    }
  })

  window.addEventListener = new Proxy(window.addEventListener, {
    apply(t, g, a) {
      if (a[0]=='message') {
        const original = a[1];

        if (!a[1]) return Reflect.apply(t, g, a);
        
        a[1] = function(event:any) {
          event = new MessageEvent(event);
  
          return original(event);
        }
      }
      return Reflect.apply(t, g, a);
    }
  })

  window.Worker.prototype.addEventListener = new Proxy(window.Worker.prototype.addEventListener, {
    apply(t, g, a) {
      if (a[0]=='message') {
        const original = a[1];
        
        a[1] = function(event:any) {
          event = new MessageEvent(event);
  
          return original(event);
        }
      }
      return Reflect.apply(t, g, a);
    }
  })
}

/*var _window = self||window

export default function(window = _window) {

  window.__DIP.message = function(target = window) {
    return function() {
      //if (target instanceof target.MessagePort||target instanceof window.MessagePort) return target.postMessage(...arguments);
      var origin = '*';
      var ports = false;
      var portArg = undefined;
      var noOrigin = false;
      if (Array.isArray(arguments[2])&&arguments[2].length&&(JSON.stringify(arguments[2].map(e=>e instanceof window.MessagePort))==JSON.stringify(arguments[2].map(e=>true)))) ports = true;
      if (target instanceof window.MessagePort) {noOrigin = true; origin = undefined;};
      if (target instanceof window.Worker) {noOrigin = true; origin = undefined;};
      if (target instanceof (window.DedicatedWorkerGlobalScope||class{})) {
        origin = undefined;
        noOrigin = true;
      };

      if (noOrigin&&ports) origin = arguments[2];
      if (ports) portArg = arguments[2];

      var finalArgs = [];

      finalArgs.push({data: arguments[0], __origin: arguments[1]});
      if (origin) finalArgs.push(origin);
      if (portArg) finalArgs.push(portArg);


      return target.postMessage(...finalArgs);
    }
  }

  class MessageEvent {
    #message = {origin: '*', data: null};
    change = true;
    
    constructor(event) {
      if (event.data&&event.data.__origin=='*') this.change = false;
      if (!event.data||!event.data.data||!event.data.__origin) this.change = false;
      for (var entry in (event)) {
        if (entry == 'data'&&!event[entry].__origin) event[entry].__origin = ''; 
        if (entry!=='origin') this[entry] = event[entry];
      }

      console.log(this);
    }
  
    get origin() {
      return this.#message.origin;
    }
    set origin(val) {
      return this.#message.origin = val;
    }
  
    get data() {
      return this.#message.data
    }
    set data(val) {
      if (val.__origin!==undefined&&val.data==undefined) {
        this.#message.origin = val.__origin;
        this.#message.data = val.data;
      }
      if (val.__origin!==undefined&&val.data!==undefined) val = val.data;
      return this.#message.data = val;
    }
  }
  
  Object.defineProperty(window, 'onmessage', {
    get() {
      return window.messageListener;
    },
    set(val) {
      if (window.messageListener) window.removeEventListener('message', window.messageListener);
      window.messageListener = val;
      window.addEventListener('message', val);
    }
  })

  Object.defineProperty(window.Worker.prototype, 'onmessage', {
    get() {
      return this.messageListener;
    },
    set(val) {
      if (this.messageListener) this.removeEventListener('message', this.messageListener);
      this.messageListener = val;
      this.addEventListener('message', val);
    }
  })
  
  window.addEventListener = new Proxy(window.addEventListener, {
    apply(t, g, a) {
      if (a[0]=='message') {
        const original = a[1];
        
        a[1] = function(event) {
          //var og = event;
          event = new MessageEvent(event);

          //if (!event.change) event = og;
  
          return original(event);
        }
      }
      return Reflect.apply(t, g, a);
    }
  })

  window.Worker.prototype.addEventListener = new Proxy(window.Worker.prototype.addEventListener, {
    apply(t, g, a) {
      if (a[0]=='message') {
        const original = a[1];
        
        a[1] = function(event) {
          //var og = event;
          event = new MessageEvent(event);

          if (!event.change) event = og;
  
          //return original(event);
        }
      }
      return Reflect.apply(t, g, a);
    }
  })

  /*window.MessagePort.prototype.addEventListener = new Proxy(window.MessagePort.prototype.addEventListener, {
    apply(t, g, a) {
      if (a[0]=='message') {
        const original = a[1];

        delete a[2];
        
        a[1] = function(event) {
          event = new MessageEvent(event);
  
          return original(event);
        }
      }
      return Reflect.apply(t, g, a);
    }
  })

  window.MessageChannel = new Proxy(window.MessageChannel, {
    construct(t, a) {
      var fake = Reflect.construct(t, a);

      return fake;
    }
  })
}*/