let babelTypes;
export function cheapTraverse(node, enter){
  if (!node) {
    return;
  }

  let keys = babelTypes.VISITOR_KEYS[node.type];
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
export function registerBabel(babel){
  babelTypes = babel.types;
}