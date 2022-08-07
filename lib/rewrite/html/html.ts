import Node from './node.ts';
import { NodeProxy, recast, iterate } from './node.ts';
import * as cookie from '../../cookie.ts';

import { parse, serialize, parseFragment } from 'parse5';
import walk from 'walk-parse5';

function SrcSet(set, proxy, meta) {
    return set.split(',').map(src => {
        var split = src.trimStart().split(' ');
        if (split[0]) split[0] = proxy.url.encode(split[0], meta);
        return split.join(' ');
    }).join(', ');
} 

function UndoSrcSet(set, proxy) {
    return set.split(',').map(src => {
        var split = src.trimStart().split(' ');
        if (split[0]) split[0] = proxy.url.decode(split[0]);
        return split.join(' ');
    }).join(', ');
}

export default class HTMLRewriter {
	constructor(proxy) {
		this.proxy = proxy;
	}
  generateRedirect(url) {
    return `
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="${url}">here</A>.
</BODY></HTML>
    `
  }
	rewrite(src, cookie, meta) {
    if (!meta.url) meta = {url: meta, origin: meta.origin, host: meta.host};
    src = serialize(parse(src));
    var proxy = this.proxy;
    var head_inject = `<head$1>
		<script>window.__DIP_config = ${JSON.stringify(proxy.config)};${cookie?`window.__DIP_config.cookie = atob(${"`"+cookie+"`"})`:''}</script>
		<script src="/dip/dip.client.js?${Math.round(Math.random()*(899999)+100000)}"></script>`;

    if (this.proxy.config.tab) {
      if (this.proxy.config.tab.icon) {
        head_inject+=`<link rel="icon" href="${this.proxy.config.tab.icon}">`;
      }
      if (this.proxy.config.tab.title) {
        head_inject+=`<title>${this.proxy.config.tab.title}</title>`;
      }
    }
    
    src = src.toString()
      .replace(/<head(.*?)>/g, head_inject);
    
    var ast = parseFragment(src)

    var nodeMap = []
    
    walk(ast, node => nodeMap.push(node))

    ast = parse(src)
    
    function walkHandler(node) {
      if (!node) return node;
      if (!node.tagName) return node;
      if ((nodeMap.indexOf(node)>-1)&&(node.tagName!=='meta'&&node.tagName!=='META')) return node;
      //console.log(node.tagName);
      node = new Node(node, {proxy: true});
      if (node.getAttribute('src')&&node.getAttribute('src').split('?')[0]!=="/dip/dip.client.js") node.setAttribute('src', proxy.url.encode(node.getAttribute('src'), meta))
      if (node.getAttribute('href')) node.setAttribute('href', proxy.url.encode(node.getAttribute('href'), meta))
      if (node.getAttribute('action')) node.setAttribute('action', proxy.url.encode(node.getAttribute('action'), meta))
      if (node.getAttribute('http-equiv')) {node.removeAttribute('content');node.removeAttribute('http-equiv');}
      if (node.getAttribute('srcset')) node.setAttribute('srcset', SrcSet(node.getAttribute('srcset'), proxy, meta));
      (Node.textContent)

      if ((node.tagName=='script'||node.tagName=='SCRIPT')&&(!node.getAttribute('src'))&&(node.getAttribute('type')!=='application/json')) {
        node.childNodes.forEach(e=>{
          if (e.nodeName!=='#text') return e;
          e.value = proxy.js.rewriteJS(e.value)
        })
      }
      if (node.tagName=='style'||node.tagName=='STYLE') {
        node.childNodes.forEach(e=>{
          if (e.nodeName!=='#text') return e;
          e.value = proxy.css.rewrite(e.value, meta)
        })
      }
      return NodeProxy(node);
    }
    
    walk(ast, walkHandler)

    src = serialize(ast)

		src = src.toString()
			.replace(/integrity/g, '_integrity')
    
    return src;
  }
}