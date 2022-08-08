
import { Syntax } from 'esotope-hammerhead';

function property(ctx) {
    const { js } = ctx;
    js.on('MemberExpression', (node, data, type) => {
      console.log(node)
        if (node.object.type === 'Super') return false;

        if (type === 'rewrite' && computedProperty(node)) {
            data.changes.push({
                node: '__uv.$wrap((',
                start: node.property.start,
                end: node.property.start,
            })
            node.iterateEnd = function() {
                data.changes.push({
                    node: '))',
                    start: node.property.end,
                    end: node.property.end,
                });
            };
    
        };
    
        if (!node.computed && node.property.name === 'location' && type === 'rewrite' || node.property.name === '__uv$location' && type === 'source') {
            data.changes.push({
                start: node.property.start,
                end: node.property.end,
                node: type === 'rewrite' ? '__uv$setSource(__uv).__uv$location' : 'location'
            });
        };


        if (!node.computed && node.property.name === 'top' && type === 'rewrite' || node.property.name === '__uv$top' && type === 'source') {
            data.changes.push({
                start: node.property.start,
                end: node.property.end,
                node: type === 'rewrite' ? '__uv$setSource(__uv).__uv$top' : 'top'
            });
        };

        if (!node.computed && node.property.name === 'parent' && type === 'rewrite' || node.property.name === '__uv$parent' && type === 'source') {
            data.changes.push({
                start: node.property.start,
                end: node.property.end,
                node: type === 'rewrite' ? '__uv$setSource(__uv).__uv$parent' : 'parent'
            });
        };


        if (!node.computed && node.property.name === 'postMessage' && type === 'rewrite') {
            data.changes.push({
                start: node.property.start,
                end: node.property.end,
                node:'__uv$setSource(__uv).postMessage',
            });
        };


        if (!node.computed && node.property.name === 'eval' && type === 'rewrite' || node.property.name === '__uv$eval' && type === 'source') {
            data.changes.push({
                start: node.property.start,
                end: node.property.end,
                node: type === 'rewrite' ? '__uv$setSource(__uv).__uv$eval' : 'eval'
            });
        };

        if (!node.computed && node.property.name === '__uv$setSource' && type === 'source' && node.parent.type === Syntax.CallExpression) {
            const { parent, property } = node; 
            data.changes.push({
                start: property.start - 1,
                end: parent.end,
            });

            node.iterateEnd = function() {
                data.changes.push({
                    start: property.start,
                    end: parent.end,
                });
            };
        };
    });
};


export { property, wrapEval, dynamicImport, importDeclaration, identifier, unwrap };