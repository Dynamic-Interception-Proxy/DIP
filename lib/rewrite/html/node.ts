// HTML DOM Wrapper, EnderKingJ#0001

import { parse, serialize, parseFragment } from 'parse5';
import walk from 'walk-parse5';

class Init {
  constructor(text) {
    this.toReturn = null
    this.functions = new DOMFunctions();
  }
  parse(text) {
    this.bareText = text.toString();
    this.functions.Initiate(text.toString())
    return NodeProxy(this.functions.nodes.find(e => e.node.nodeName=='#document'))
  }
  get html() {
    return serialize(this.functions.ast)
  }
  bundle() {
    return this.html
  }
}

function recast(str, fn, options = {}) {
  try {
    const ast = (options.document ? parse : parseFragment)(new String(str).toString());
    ast = iterate(ast, fn, options);
    return serialize(ast);
  } catch(e) {
    console.log(e)
    return str;
  };
};
function iterate(ast, fn, fnOptions = {}) {
  if (!ast) return ast;
  
  if (ast.node.tagName) {
    if (ast.node.tagName!=='script'&&ast.node.tagName!=='link') return ast;
    const element = new Node(ast, false, fnOptions);
    fn(element);
    if (ast.attrs) {
      for (const attr of ast.attrs) {
        //if (!attr.skip) fn(new AttributeEvent(element, attr, fnOptions));
      };
    };
  };

  if (ast.childNodes) {
    for (const child of ast.childNodes) {
      if (!child.skip) child = iterate(child, fn, fnOptions);
    };
  };

  return ast;
};

export {recast, iterate}

class DOMFunctions {
  constructor() {
    
  }
  Initiate(ast) {
    this.tree = parse(ast);
    this.nodes = [];
    walk(this.tree, node => {
      node = new Node(node, this.tree)
      this.nodes.push(node)
    })
  }
  get ast() {
    return this.tree
  }
}

export default class Node {
  constructor(node, config = {}) {
    this.node = node;
    this.config = config;
    return NodeProxy(this);
  }
  get textContent() {
      let str = '';
    
      iterate(this.node.childNodes, node => {
        console.log(node)
        if (node.nodeName === '#text') str += node.value;
      });

    console.log(str)
      
      return str;
  }
};

export function NodeProxy(node) {
  var oNode = node.node;
  return new Proxy(node, {
    get(ob, prop) {
      if (oNode[prop]) return oNode[prop];
      else return ob[prop];
    },
    set(ob, prop, val) {
      if (prop=='attrs') return oNode[prop] = val;
      if (oNode[prop]) return oNode[prop] = val;
      else return ob[prop] = val;
    }
  });
};

Node.prototype.getAttribute = function(attr, comma = false) {
  if (this.nodeName=='script') comma = true;
  if (!this.attrs) this.attrs = [];
  var attribute = this.attrs.find(e => e.name==attr);
  if (attribute==undefined&&comma==false) return null;
  if (attribute) return attribute.value;
  if (attribute==undefined&&comma==true) return "";
}

Node.prototype.setAttribute = function(attr, value) {
  if (!this.attrs) this.attrs = [];
  var attribute = this.attrs.find(e => e.name==attr);
  if (this.config.proxy) this.attrs.push({name: 'data-dip_'+attribute.name, value: attribute.value})
  if (!attribute) this.attrs.push({name: attr, value: value})
  else attribute.value = value;
  return ;
}

Node.prototype.removeAttribute = function(attr) {
  if (!this.attrs) this.attrs = [];
  var index = this.attrs.findIndex(e => e.name==attr);
  this.attrs.splice(index||-1, 1)
  return index;
}

//export default Init;