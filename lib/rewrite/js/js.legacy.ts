import Encoding from '../../encoding.ts';

export default class JSRewriter {
	constructor(proxy) {
		this.proxy = proxy;
	}
  headInject(src, opts) {
    return `
if (self.importScripts) {
  this.proxy = {URL: new URL("${String(this.proxy.URL)}"), config: ${JSON.stringify(this.proxy.config)}}

  var xor = {key: ${Encoding.xor.key}}

  this.proxy.encodeURL = function ${this.proxy.encodeURL.toString()}
  this.proxy.decodeURL = function ${this.proxy.decodeURL.toString()}

  var urlRewrite = function ${this.proxy.url.encode.toString()}
  var urlDecode = function ${this.proxy.url.decode.toString()}

  self.importScripts = new Proxy(self.importScripts, {
    apply(t, g, a) {
      a = [...a].map(link => {
        return urlRewrite(link);
      });
      a.forEach(link => {
        var url = new URL(urlDecode(link));
        var opts = {
          method: 'GET',
          headers: {
            'x-bare-host': url.hostname,
            'x-bare-protocol': url.protocol,
            'x-bare-path': url.pathname+url.search,
            'x-bare-port': url.port||(url.protocol=='https:'?443:80),
            'x-bare-headers': JSON.stringify({host: url.hostname}),
          },
        }
        fetch('/bare/v2/?cache='+(Math.floor(Math.random()*(99999999-10000000)+10000000)), opts).then(e => e.text()).then(e => self.eval.apply(self, [e]))
      })
    }
  })

  self.fetch = new Proxy(self.fetch, {
    apply(t, g, a) {
      if (a[0] instanceof Request) return Reflect.apply(t, g, a);
      console.log(a[0])
      if (a[0].startsWith('/bare/v2/')) return Reflect.apply(t, g, a);

      var url = new URL(urlDecode(urlRewrite(a[0])))

      console.log(url)

      a[0] = "/bare/v1/?cache="+(Math.floor(Math.random()*(99999999-10000000)+10000000))

      a[1] = {
        method: (a[1]?(a[1].method||'GET'):'GET'),
        headers: {
          'x-bare-host': url.hostname,
          'x-bare-protocol': url.protocol,
          'x-bare-path': url.pathname+url.search,
          'x-bare-port': url.port||(url.protocol=='https:'?443:80),
          'x-bare-headers': JSON.stringify((a[1]||{headers: {host: url.hostname}}).headers),
          'x-bare-forward-headers': JSON.stringify(['accept-encoding', 'connection','content-length']),
        },
      }

      return new Promise(async function(res, rej) {
        var fetched = await Reflect.apply(t, g, a);

        var opts = {
          status: fetched.headers.get('x-bare-status'),
          statusText: fetched.headers.get('x-bare-status-text'),
          headers: new Headers(JSON.parse(fetched.headers.get('x-bare-headers'))),
        }

        res(new Response(new Blob([await fetched.text()]), opts))
      })
    }
  })

    /*self.postMessage = new Proxy(self.postMessage, {
      apply(t, g, a) {
        //return Reflect.apply(t, g, [[a[0], a[1]], '*', a[2]]);
      }
    })*/

    /*self.messageListeners = [];

    self.addEventListener('message', (e) => {
      console.log(e)
    })

    Object.defineProperty(self, 'onmessage', {
      set(val) {
        self.messageListeners.splice(self.messageListeners.findIndex(e=>e.type=='onmessage'), 1)
        self.messageListeners.push({function: val, type: 'onmessage'});
      },
      get() {
        return self.messageListeners.find(e=>e.type=='onmessage')||null
      }
    })

    postMessage = self.postMessage;

    var evLis = {
      apply(t, g, a) {
        if (a[0]=='message') {
          return self.messageListeners.push(a[1]);
        }
        return Reflect.apply(t, g, a)
      }
    }

    self.addEventListener = new Proxy(self.addEventListener, evLis);*/
};

/*DIP-DONE*/;

`
  }
	rewrite(src, opts) {
		return this.headInject(src, opts)+src
			.replace(/(,| |=|\(|\{|\}|\+|\[|\]|\|)document.location(,| |=|\)|\.)/gi, str => {
				return str.replace('.location', `.__DIP.location`).replace(',location', ',__DIP.location');
			})
			.replace(/(,| |=|\(|\{|\}|\+|\[|\]|\|)(self|window).location(,| |=|\)|\.)/gi, str => {
				return str.replace('.location', `.__DIP.location`).replace(',location', ',__DIP.location');
			})
      .replace(/(,| |=|\(|\{|\}|\+|\[|\]|\|)location(,| |=|\)|\.)/gi, str => {
				return str.replace('location', `__DIP.location`)
			})
			.replace(/integrity/g, '_integrity');
	}
}