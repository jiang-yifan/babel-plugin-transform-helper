'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.printAst = printAst;
exports.cheapTraverse = cheapTraverse;
exports.makeArr = makeArr;
exports.isRefIdentifier = isRefIdentifier;
var babel = exports.babel = {},
    File = exports.File = void 0,
    template = exports.template = void 0,
    types = exports.types = void 0;

function register(babelCore) {
  exports.babel = babel = babelCore;
  exports.File = File = babelCore.File;
  exports.types = types = babelCore.types;
  exports.template = template = babelCore.template;
}
function printAst() {
  var file = new File({ compact: true }),
      body = [];
  Array.prototype.forEach.call(arguments, function (ast) {
    return ast instanceof Array ? ast.forEach(addAst) : addAst(ast);
  });
  file.addAst(babel.types.File(types.Program(body)));
  return file.generate().code;
  function addAst(ast) {
    if (types.isStatement(ast)) {
      return body.push(ast);
    }
    throw Error('Ast should be a statement');
  }
}
function cheapTraverse(node, enter) {
  if (!node) {
    return;
  }

  var keys = types.VISITOR_KEYS[node.type];
  if (!keys) {
    return;
  }

  var ret = enter(node);
  if (ret === false) {
    return;
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var subNode = node[key];

      if (Array.isArray(subNode)) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = subNode[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _node = _step2.value;

            cheapTraverse(_node, enter);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } else {
        cheapTraverse(subNode, enter);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}
function makeArr(arg) {
  if (arg instanceof Array) {
    return arg.slice();
  } else {
    return [arg];
  }
}
function isRefIdentifier(path) {
  return path.parentKey !== 'property';
}