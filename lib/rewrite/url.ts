import Encoding from '../encoding.ts';
import path from 'path-browserify';

export default class urlRewriter {
	constructor(proxy) {
		this.proxy = proxy;
	}
  encoding() {
    let encoding;
    
    switch(this.proxy.config.encoding) {
      case "xor":
        encoding = Encoding.xor;
        break;
      case "plain":
        encoding = Encoding.plain;
        break;
      case "base64":
        encoding = Encoding.base64;
        break;
      case "shuffle":
      default:
        encoding = Encoding.plain;
        break;
    }
    
    this.proxy.encodeURL = encoding.encode;
    this.proxy.decodeURL = encoding.decode;
  }
	encode(url, meta) {
    if (!url&&url!=='') return url;
    if (!this.proxy.decodeURL) this.encoding();

    if (!meta.url) meta.url = meta;
    
		url = String(url);

    if (url == '') url = meta.url.href;

    if (url.match(/^(data:|#|about:|javascript:|mailto:|blob:)/g)) return url;
    url = url.replace(/^\/\//g, meta.url.protocol+'//')
		if (url.startsWith(this.proxy.config.prefix)) return url;
    url = url.replace(location.host, meta.url.host)
    if (url.match(/^(\.\.\/|\.\/)/gi)) {
      var dir = (path.parse(meta.url.pathname)).dir
      url = path.join(dir, url);
    }
    if ((!url.startsWith('http'))&&(!url.startsWith('/'))) {
      var parsed = path.parse(meta.url.pathname);
      //console.log(parsed)
      //if (!parsed.ext) parsed.dir = parsed.root+parsed.base;
      if (parsed.dir=='/') parsed.dir = '';
      url = (meta.origin+parsed.dir+'/'+url)
      //console.log(url, parsed)
      //url = meta.origin+url
    }
		if (!url.startsWith('http')) {url = meta.origin+(url.startsWith('/')?url:'/'+url)};
    if (this.proxy.config.replit) url = url.replace('https://','https:/');
		return this.proxy.config.prefix + this.proxy.encodeURL(url);
	}
	decode(url) {
    if (!url) return url;
    if (!this.proxy.decodeURL) this.encoding();
    
		var index = url.indexOf(this.proxy.config.prefix);

		if(index == -1){
			throw new Error('bad URL');
		}

		url = url.slice(index + this.proxy.config.prefix.length)
			.replace('https://', 'https:/')
			.replace('https:/', 'https://');

    if (this.proxy.config.replit!=undefined) url = url.replace('https://','https:/');

    if (this.proxy.config.encoding!=='plain'&&url.split('/').length>1) {
      var one = url.split('/')
      var two = one.map((e,i) => {if (i!==0&&e) return e+'/'; else return ''}).join('');
      if (!url.endsWith('/')) two = two.replace(/\/$/g,'')
      one = one[0];
      if (two&&(!this.proxy.decodeURL(one).endsWith('/'))) two = '/'+two;
      try {
        url = this.proxy.encodeURL(this.proxy.decodeURL(one)+two);
      } catch(e) {
        console.log(e)
      }
    }

		url = new URL(this.proxy.decodeURL(url));

		return url;
	}
};