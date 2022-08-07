import wrapWindow from './proxywindow.ts'

var allowList = ['src', 'href']

var _window = self||window

export function Element(win : any = _window) {

  win.document.querySelectorAll('*[integrity]').forEach((node:HTMLScriptElement) => {
    node.setAttribute('_integrity', node.integrity); node.removeAttribute('integrity')
  })

  var AttrValue = Object.getOwnPropertyDescriptor(win.Attr.prototype, 'value')

  Object.defineProperty(win.Attr.prototype, 'value', {
    get() {
      try {
        if (this.name=='src'||this.name=='href'||this.name=='action')
          return win.proxy.url.decode(AttrValue.get.call(this));
        else return AttrValue.get.call(this);
      } catch(e) {
        return AttrValue.get.call(this);
      }
    },
    set(val) {
      if (this.name=='src'||this.name=='href'||this.name=='action')
        val = win.proxy.url.encode(val, win.proxy.meta.url);

      return AttrValue.set.call(this, val);
    }
  })

  win.ElemLinkWrapper = function() {
    try {
      if (!win.document) return clearInterval(win.ElemLinkWrapper.interval);
      [...win.document.links, ...win.document.images].forEach(link => {
        if (link.href&&(!link.getAttribute('data-dip_href'))) {
          link.setAttribute('data-dip_href', link.getAttribute('href'))
          link.setAttribute('href', (link.getAttribute('href')));
        };
        if (link.src&&(!link.getAttribute('data-dip_src'))) {
          link.setAttribute('data-dip_src', link.getAttribute('src'))
          link.setAttribute('src', (link.getAttribute('src')));
        };
      });
    } catch(e) {
      return;
    }
  };

  win.ElemLinkWrapper.interval = setInterval(win.ElemLinkWrapper, 1000);

  try {
    Object.defineProperty(win.HTMLElement.prototype, 'baseURI', {
      get() {
        return win.__DIP.location.href;
      },
      set() {
        return arguments[0];
      }
    });
  } catch(e) {
    
  }
  
  win.HTMLElement.prototype.setAttribute = new Proxy(win.HTMLElement.prototype.setAttribute, {
    apply(target, thisArg, [ element_attribute, value ]) {
      if (element_attribute.toLowerCase()=='integrity') {thisArg.setAttribute('_integrity', thisArg.getAttribute('integrity')); return thisArg.removeAttribute('integrity')}
      if (!value) return Reflect.apply(target, thisArg, [element_attribute, value])

      if (element_attribute=='srcset') {
        //value = $Rhodium.RewriteSrcset(value)

        return Reflect.apply(target, thisArg, [ element_attribute, value ]);
      };

      if (['src', 'data', 'href', 'action'].indexOf(element_attribute.toLowerCase())>-1) thisArg.dataset['dip_'+element_attribute] = value

      if (['src', 'data', 'href', 'action'].indexOf(element_attribute.toLowerCase())>-1) value = win.proxy.url.encode(value, win.proxy.meta.url);
      return Reflect.apply(target, thisArg, [ element_attribute, value ]);
    }
  })
  win.HTMLElement.prototype.getAttribute = new Proxy(win.HTMLElement.prototype.getAttribute, {
    apply(target, thisArg, [ element_attribute ]) {
      if (element_attribute.toLowerCase()=='integrity') element_attribute = '_integrity'
      var value = Reflect.apply(target, thisArg, [element_attribute]);
      var proxyValue = (thisArg.dataset['dip_'+element_attribute])
      if (proxyValue) return proxyValue;
      if (value) return value;
      if (['src', 'data', 'href', 'action'].indexOf(element_attribute.toLowerCase())>-1) return '';
      return null;
    }
  })
}

export function Definer(win:any = _window) {
    var config = [
        {
            "elements": [win.HTMLScriptElement, win.HTMLIFrameElement, win.HTMLEmbedElement, win.HTMLInputElement, win.HTMLTrackElement, win.HTMLMediaElement,win.HTMLSourceElement, win.Image, win.HTMLImageElement],
            "tags": ['src'],
            "action": "url"
        },
        {
            "elements": [win.HTMLSourceElement, win.HTMLImageElement],
            "tags": ['srcset'],
            "action": "srcset"
        },
        {
            "elements": [win.HTMLAnchorElement, win.HTMLLinkElement, win.HTMLAreaElement],
            "tags": ['href'],
            "action": "url"
        },
        {
            "elements": [win.HTMLIFrameElement],
            "tags": ['contentWindow'],
            "action": "window"
        },
        {
          "elements": [win.HTMLIFrameElement],
          "tags": ['contentDocument'],
          "action": "document"
        },
        {
            "elements": [win.HTMLFormElement],
            "tags": ['action'],
            "action": "url"
        }, 
        {
            "elements": [win.HTMLObjectElement],
            "tags": ['data'],
            "action": "url",
        }
    ];
    config.forEach(handler => {
        var action = handler.action
        var tags = handler.tags
        var elements = handler.elements
        elements.forEach(element => {
              
            try {
                var descriptor = Object.getOwnPropertyDescriptor(element.prototype, 'innerHTML');
    
                if (descriptor) Object.defineProperty(element.prototype, 'innerHTML', {
                    get() {
                        return descriptor.get.call(this).toString().replace(/_integrity/g, 'integrity').replace(/_location/g, 'location');
                    },
                    set(val) {
                        return descriptor.set.call(this, val.toString().replace(/<meta[^>]+>/g, '').replace(/integrity/g, '_integrity').replace(/location/g, '_location').replace(/rel=["']?preload["']?/g, '').replace(/rel=["']?preconnect["']?/g, ''));
                    }
                });
            } catch(e) {
              //console.log(e)
            }

            try {
              var descriptor = Object.getOwnPropertyDescriptor(element.prototype, 'outerHTML');
  
              if (descriptor) Object.defineProperty(element.prototype, 'outerHTML', {
                  get() {
                      return descriptor.get.call(this).toString().replace(/_integrity/g, 'integrity').replace(/_location/g, 'location');
                  },
                  set(val) {
                      return descriptor.set.call(this, val.toString().replace(/<meta[^>]+>/g, '').replace(/integrity/g, '_integrity').replace(/location/g, '_location').replace(/rel=["']?preload["']?/g, '').replace(/rel=["']?preconnect["']?/g, ''));
                  }
              });
          } catch(e) {
            //console.log(e)
          }

            tags.forEach(tag => {
                if (action=='window'||action=='document') var windowDescriptor = Object.getOwnPropertyDescriptor(element.prototype, 'contentWindow')
                try {
                    Object.defineProperty(element.prototype, tag, {
                        get() {
                            if (action=='window') {
                              try {
                                var done = windowDescriptor.get.call(this);
                                done = wrapWindow(done);
                                return done
                              } catch(e) {
                                return windowDescriptor.get.call(this)
                              }
                            }
                            if (action=='document') {
                              try {
                                var done = windowDescriptor.get.call(this);
                                done = wrapWindow(done);
                                return done.document
                              } catch(e) {
                                return windowDescriptor.get.call(this).document
                              }
                            }
                            return this.getAttribute(tag);
                        },
                        set(val) {
                            var a = this.setAttribute(tag, val);
                            win.ElemLinkWrapper();
                            return a;
                        }
                    })
                } catch(e) {
                }

                try {
                  Object.defineProperty(element.prototype, 'integrity', {
                    set(val) {
                      this.setAttribute('integrity', val)
                    },
                    get() {
                      return this.getAttribute('_integrity')
                    }
                  })
                } catch(e) {
                }
            })
        })
    });

    try {
        Object.defineProperty(win.HTMLElement.prototype,'integrity',{
            get() {
                return this.getAttribute('_integrity')
            },
            set(val) {
                return this.setAttribute('_integrity', val)
            }
        });
    } catch(e) {
      
    }
}