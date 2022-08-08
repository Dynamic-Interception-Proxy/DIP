import * as Meriyah from 'meriyah';
import { generate } from 'escodegen';
import { Syntax } from 'esotope-hammerhead';
import { isConforming } from '../../../../public/uv/uv.bundle';

function MemberExpression(node, type, parent) {
    if (node.object.type === 'Super') return false;

    if (computedProperty(node)) {
        console.log(node)
    };

    if (!node.computed && node.property.name === 'location') {
        node.property.name = '__DIP.location'
    };


    if (!node.computed && node.property.name === 'top') {
        node.property.name = '__DIP.get(top)'
    };

    if (!node.computed && node.property.name === 'parent') {
        node.property.name = '__DIP.get(top)'
    };


    if (!node.computed && node.property.name === 'postMessage') {
        Object.entries({
            type: 'CallExpression',
            callee: {type: 'Identifier', name: `__DIP.message`},
            arguments: [{type:'Identifier', name: node.object.name}],
        }).forEach(e=>node[e[0]]=e[1]);
    };


    if (!node.computed && node.property.name === 'eval') {
        node.property.name = '__DIP.eval';
    };
}

function Identifier(node, type, parent = {}) {
    if (!['location', 'eval', 'parent', 'top'].includes(node.name)) return false;
    if (parent.type === Syntax.VariableDeclarator && parent.id === node) return false;
    if ((parent.type === Syntax.AssignmentExpression || parent.type === Syntax.AssignmentPattern) && parent.left === node) return false;
    if ((parent.type === Syntax.FunctionExpression || parent.type === Syntax.FunctionDeclaration) && parent.id === node) return false;
    if (parent.type === Syntax.MemberExpression && parent.property === node && !parent.computed) return false;
    if (node.name === 'eval' && parent.type === Syntax.CallExpression && parent.callee === node) return false;
    if (parent.type === Syntax.Property && parent.key === node) return false;
    if (parent.type === Syntax.Property && parent.value === node && parent.shorthand) return false;
    if (parent.type === Syntax.UpdateExpression && (parent.operator === '++' || parent.operator === '--')) return false;
    if ((parent.type === Syntax.FunctionExpression || parent.type === Syntax.FunctionDeclaration || parent.type === Syntax.ArrowFunctionExpression) && parent.params.indexOf(node) !== -1) return false;
    if (parent.type === Syntax.MethodDefinition) return false;
    if (parent.type === Syntax.ClassDeclaration) return false;
    if (parent.type === Syntax.RestElement) return false;
    if (parent.type === Syntax.ExportSpecifier) return false;
    if (parent.type === Syntax.ImportSpecifier) return false;
    
    node.name = `__DIP.get(${node.name})`;
}

function CallExpression(node, type, parent = {}) {

}

function Literal(node, type, parent = {}) {
    if ((parent.type === Syntax.ImportDeclaration || parent.type === Syntax.ExportAllDeclaration || parent.type === Syntax.ExportNamedDeclaration)) {
        node.value = this.proxy.url.encode(node.value, this.proxy.meta);
    }
}

function computedProperty(parent) {
    if (!parent.computed) return false;
    const { property: node } = parent; 
    if (node.type === 'Literal' && !['location', 'top', 'parent']) return false;
    return true;
};

class TwentyThree23 {
    config = {};
    
    constructor(config = {}) {
      this.config = config;
      this.loadData(config);
    }
  
    loadData(config) {
      this.config = config;
    }
  
    rewriteJS(src, config = {head: true, parse: {ranges: false,module: true,globalReturn: true}}) {
      if (src.includes('window.__DIP_config = {')) return src;
      this.emit = function(type, node, parent = {}) {
          if (eval(node.type)) eval(node.type)();
      }
      
      this.iterate = function(ast, handler) {
          if (typeof ast != 'object' || !handler) return;
          walk(ast, null, handler);
          function walk(node, parent, handler) {
              if (typeof node != 'object' || !handler) return;
              handler(node, parent, handler);
              for (const child in node) {
                  if (child === 'parent') continue;
                  if (Array.isArray(node[child])) {
                      node[child].forEach(entry => { 
                          if (entry) walk(entry, node, handler)
                      });
                  } else {
                      if (node[child]) walk(node[child], node, handler);
                  };
              };
              if (typeof node.iterateEnd === 'function') node.iterateEnd();
          };
      };
  
      this.process = src => {
        var ast = Meriyah.parse(src, config.parse);
  
        this.iterate(ast, (node, parent = null) => {
          this.emit(node.type, node, parent)
        })
  
        src = generate(ast)
  
        return src;
      }
      
      try {
        src = this.process(src);
      } catch(e) {

      }
  
      if (config.head) src = `if (!self.__DIP && self.importScripts) importScripts('/dip/dip.config.js', '/dip/dip.handler.js?'+Math.floor((Math.random()*(899999)+100000)));\n`+src
  
      return src;
    }
  }
  
  export default TwentyThree23;