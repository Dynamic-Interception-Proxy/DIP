import * as mime from './mime.ts';
import * as data from './data.ts';
const { defaultConfig, headerData } = data.default;

export default class DynamicRequest {
    Headers = class DynamicHeaders {
        bare = {};
  
      constructor(ctx) {
        var that = this;
        if (ctx&&(ctx instanceof Headers||ctx instanceof Object)) Object.entries(ctx).forEach(([name, value]) => {if (name=='set'||name=='get'||name=='delete'||name=='bare') return; that.bare[name.toLowerCase()]=value;that.bare[name]=value;that[name.toLowerCase()]=value;return that[name] = value;});
      }
  
      get(header) {
        return this[header]||null;
      }
  
      set(header, value) {
        this[header] = value;
      }
      
      delete(header) {
        return delete this[header];
      }
  
      entries() {
        return Object.entries(this.bare);
      }
    }
  
    constructor(request, bare) {
      this.request = request;
      this.Bare = bare;
    }

    get Request() {
      return class DynamicRequest {
        constructor(url, init) {
          if (init.headers) this.headers = init.headers;
          if (init.redirect) this.redirect = init.redirect;
          if (init.body) this.body = init.body;
          this.method = 'GET';
          if (init.method) this.method = init.method;
          this.url = new String(url);
        }

        get init() {
          return {
            headers: this.headers||{},
            redirect: this.redirect||'manual',
            body: this.body||undefined,
            method: this.method||'GET',
          }
        }
      }
    }
  
    isHtml(url, contentType = '', html = '') {
      return (mime.contentType((contentType || url.pathname)) || 'text/html').split(';')[0] === 'text/html'||html.trim().match(/\<\!(doctype|DOCTYPE) html\>/g);
    };
  
    isJs(url, contentType = '') {
      var type = (mime.contentType((contentType || url.pathname)) || 'application/javascript').split(';')[0];
  
      return type=='text/javascript'||type=='application/javascript';
    }
  
    isCss(url, contentType = '') {
      return (mime.contentType((contentType || url.pathname)) || 'text/css').split(';')[0] === 'text/css';
    }

    CSPMatch(handler, origin, target, data) {
      data = data.split(' ');

      if (data.indexOf(target.hostname)!==-1) return true;
      if (data.indexOf(target.origin)!==-1) return true;
      if (data.indexOf('*.'+target.hostname)!==-1) return true;

      if (((data.indexOf("'self'"))!==-1)||((data.indexOf('"self"'))!==-1)) if (origin.origin==target.origin) return true;

      return false;
    }

    CORS(header, origin, url) {
      if (header=='null') return true;
      if (header=='*') return true;

      console.log(header, origin);

      if (header!==origin&&url) return false;
      return true;
    }

    CSP(header) {
      var object = {}

      header.split(';').map(newHeader => {
        newHeader = newHeader.replace(/^\s/g, '')

        var property = newHeader.split(' ')[0];

        var value = newHeader.split(' ').splice(1).join(' ');

        object[property] = value;
      });

      Object.entries(headerData.cspData).map(([name, [destination, fallbacks]]) => {
        if (name=='default-src') return;
        if (!object[name]) object[name] = object[fallbacks.pop()];
      })

      return object;
    }

    get meta() {
      return this.request.meta;
    }
  
    get config() {
      return self.__DIP.config;
    }
  
    get Dynamic() {
      return self.__DIP;
    }
  
    get html() {
      return self.__DIP.html;
    }
  
    get css() {
      return self.__DIP.css;
    }
  
    get js() {
      return self.__DIP.js;
    }
  
    get url() {
      return self.__DIP.url;
    }
  }