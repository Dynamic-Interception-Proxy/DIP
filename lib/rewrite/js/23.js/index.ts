import * as Meriyah from 'meriyah';
import { generate } from 'escodegen';
import { parseConditionalExpression } from 'meriyah/dist/src/parser';

class TwentyThree23 {
  config = {};
  emit:Function=function(){};
  process:Function=function(){};
  iterate:Function=function(){};
  
  constructor(config = {}) {
    this.config = config;
    this.loadData(config);
  }

  loadData(config:any) {
    this.config = config;
  }

  rewriteJS(src:any, config = {head: true, module: false, destination: 'script'}) {
    if (src.includes('window.__DIP_config = {')) return src;
    this.emit = function(type:any, node:any, parent:any = {}) {
      if (type=='Literal'&&(parent.type=='ImportDeclaration'||parent.type=='ExportNamedDeclaration'||parent.type=='ExportAllDeclaration')) {
        node.value = this.proxy.url.encode(node.value, this.proxy.meta);
      }
      if (type=='Literal') if (node.value=='__DIP') node.value = 'undefined';
      if (type=='Literal') if (node.value=='location') node.value = '__DIP.location';
      if (type=='Identifier') {
        if (node.name=='location'&&parent.type=='BinaryExpression') node.name = '__DIP.location'

        if (node.name == '__DIP') node.name = 'undefined';
        if (node?.name=='postMessage'&&parent.type=='CallExpression') {
          var original = 'undefined'
          node.type = 'CallExpression';
          //console.log(parent.arguments)
          node.callee = {type: 'Identifier', name: '__DIP.message'}
          node.arguments = [{type: 'Identifier', name: original}]
          if (parent=='CallExpression') {
            parent.arguments = parent.arguments
          }
        }
      }
      if (type=='MemberExpression'&&node.object.type=='Identifier') {
        if (node.property?.type=='Literal') {
          if (node.property?.value == 'postMessage') {
            if (parent.type=='CallExpression'&&parent.callee==node) {
              Object.entries({
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {type: 'Identifier', name: 'self'},
                  property: {type: 'Identifier', name: '__DIP.message'},
                },
                arguments: [
                  {type: 'Identifier', name: node.object?.name},
                ]
              }).forEach(([e,v])=>node[e]=v)

              return;
            }
          }
        }
        if (node.property?.name=='postMessage') {
          var original:string = node.object?.name
          node.type = 'CallExpression';
          //console.log(parent.arguments)
          node.callee = {type: 'Identifier', name: '__DIP.message'}
          node.arguments = [{type: 'Identifier', name: original}]
          if (parent=='CallExpression') {
            parent.arguments = parent.arguments
          }
        }

        if (config.destination!=='worker') {
          if (node.property.name=='window'&&node.object.name!='top'&&(node.object.name=='self'||node.object.name=='globalThis')) if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.property.name = '__DIP.window';
          if (node.object.name=='top') if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.object.name = 'top.__DIP.window';
          if (node.property.name=='top'&&(node.object.name=='self'||node.object.name=='globalThis')) if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.property.name = 'top.__DIP.window';
          if (node.object.name=='window') {
            if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.object.name = 'self.__DIP.window';
          };
          if (node.object.name=='parent') {
            if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.object.name = 'self.parent.__DIP.window';
          };
          if (node.property.name == '__DIP') node.property.name = 'undefined';
          if (node.object.name=='self') {
            if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.object.name = 'self.__DIP.window';
          };
          if (node.object.name=='globalThis') {
            if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.object.name = 'self.__DIP.window';
          };
          if (node.object?.name=='location') node.object.name = '__DIP.location';
        }
      }

      /*if (config.destination!=='worker'&&node.type=='Identifier'&&parent.type!=='MemberExpression'&&parent.type!=='Property'&&parent.type!=='CallExpression') {
        if (node.name=='top'&&(node.name=='self'||node.name=='globalThis')) if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.name = 'top.__DIP.window';
        if (node.name=='window') {
          if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.name = 'self.__DIP.window';
        };
        if (node.name=='parent') {
          if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.name = 'self.parent.__DIP.window';
        };
        if (node.name == '__DIP') node.name = 'undefined';
        if (node.name=='self') {
          if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.name = 'self.__DIP.window';
        };
        if (node.name=='globalThis') {
          if (parent.type!=='NewExpression'&&(parent.type!=='CallExpression'||((parent.type=='CallExpression')&&node!==parent.callee))) node.name = 'self.__DIP.window';
        };
        if (node.name=='location') node.name = '__DIP.location';
      }*/
    }
    
    this.iterate = function(ast:any, handler:any) {
        if (typeof ast != 'object' || !handler) return;
        walk(ast, null, handler);
        function walk(node:any, parent:any, handler:any) {
            if (typeof node != 'object' || !handler) return;
            handler(node, parent, handler);
            for (const child in node) {
                if (child === 'parent') continue;
                if (Array.isArray(node[child])) {
                    node[child].forEach((entry:any) => { 
                        if (entry) walk(entry, node, handler)
                    });
                } else {
                    if (node[child]) walk(node[child], node, handler);
                };
            };
            if (typeof node.iterateEnd === 'function') node.iterateEnd();
        };
    };

    this.process = (src:any) => {
      var ast = (config.module?Meriyah.parseModule:Meriyah.parseScript)(src);

      this.iterate(ast, (node:any, parent:any = null) => {
        this.emit(node.type, node, parent)
      })

      src = generate(ast)

      return src;
    }
    
    try {
      src = this.process(src);
    } catch(e) {
      try {
        config.module = true;
        src = this.process(src);
      } catch(e) {
        console.log(e);
      }
    }

    if (config.head) src = `if (!self.__DIP && self.importScripts) importScripts('/dip/dip.config.js', '/dip/dip.handler.js?'+Math.floor((Math.random()*(899999)+100000)));\n`+src

    return src;
  }
}

export default TwentyThree23;