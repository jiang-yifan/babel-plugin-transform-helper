export let babel = {}, File, template, types;

export function register(babelCore) {
  babel = babelCore;
  File = babelCore.File;
  types = babelCore.types;
  template = babelCore.template;
}
export function printAst() {
  let file = new File({ compact: true }), body = [];
  Array.prototype.forEach.call(arguments, ast => ast instanceof Array ? ast.forEach(addAst) : addAst(ast));
  file.addAst(babel.types.File(types.Program(body)));
  return file.generate().code;
  function addAst(ast) {
    if (types.isStatement(ast)) {
      return body.push(ast);
    }
    throw Error('Ast should be a statement');
  }
}
export function cheapTraverse(node, enter) {
  if (!node) {
    return;
  }

  let keys = types.VISITOR_KEYS[node.type];
  if (!keys) {
    return;
  }

  let ret = enter(node);
  if (ret === false) {
    return;
  }

  for (let key of keys) {
    let subNode = node[key];

    if (Array.isArray(subNode)) {
      for (let node of subNode) {
        cheapTraverse(node, enter);
      }
    } else {
      cheapTraverse(subNode, enter);
    }
  }
}
export function makeArr(arg) {
  if (arg instanceof Array) {
    return arg.slice();
  } else {
    return [arg]
  }
}
export function isRefIdentifier(path) {
  return path.parentKey !== 'property'
}