import { parse, generate, findAll } from 'css-tree';

export default class CSSRewriter {
	constructor(proxy) {
		this.proxy = proxy;
	}
	rewrite(src, url, config = {}) {

    var ast = parse(src, {
      context: config.type||'stylesheet',
      parseCustomProperty: true, 
    })
    
    var results = findAll(ast, (node, item, list) =>
        node.type === 'Url'
    );
    
    for (var result in results) {
      if (!url.url) url.url = url;
      results[result].value = this.proxy.url.encode(results[result].value, url)
    }
    
    return generate(ast)
	}
}