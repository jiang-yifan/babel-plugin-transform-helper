'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HelperRemap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.registerBabel = registerBabel;
exports.getRelativePath = getRelativePath;
exports.traverseExportNames = traverseExportNames;

var _babelHelpers = require('babel-helpers');

var babelHelpers = _interopRequireWildcard(_babelHelpers);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _cheapTraverse = require('./cheapTraverse');

var traverse = _interopRequireWildcard(_cheapTraverse);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var babel = undefined,
    helperDefineTemplate = undefined,
    helperImportTemplate = undefined,
    helperRequireTemplate = undefined,
    StringLiteral = undefined,
    Identifier = undefined,
    File = undefined,
    Program = undefined;
var DEF_HELPER_FILE_PATH = '__temp_helper_file.js';

var HelperRemap = exports.HelperRemap = function () {
  function HelperRemap(babelCore) {
    _classCallCheck(this, HelperRemap);

    this.usedHelpers = [];
    registerBabel(babelCore);
  }

  _createClass(HelperRemap, [{
    key: 'isHelperFile',
    value: function isHelperFile(sourcePath) {
      return sourcePath == this.helperAbsPath && this._helperFileExist;
    }
  }, {
    key: 'useHelper',
    value: function useHelper(name, relativePath) {
      var usedHelpers = this.usedHelpers;

      if (usedHelpers.indexOf(name) == -1) {
        usedHelpers.push(name);
        this._invalidTempFile = true;
      }
      return helperRequireTemplate({
        HELPER_NAMESPACE: StringLiteral(relativePath),
        METHOD_NAME: Identifier(name)
      }).expression;
    }
  }, {
    key: 'getUsedMethods',
    value: function getUsedMethods() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var exclude = _ref.exclude;

      if (!Array.isArray(exclude)) {
        exclude = [];
      }
      var ret = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.usedHelpers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var name = _step.value;

          if (exclude.indexOf(name) == -1) {
            ret.push(helperDefineTemplate({
              METHOD_NAME: Identifier(name),
              METHOD: babelHelpers.get(name)
            }));
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

      return ret;
    }
  }, {
    key: 'checkHelperPath',
    value: function checkHelperPath(filename) {
      if (!filename) {
        throw Error('filename empty');
      }
      if (path.extname(filename) !== '.js') {
        filename = filename + '.js';
      }
      try {
        fs.statSync(filename);
        this._helperFileExist = true;
      } catch (ex) {
        this._helperFileExist = false;
      }
      return filename;
    }
  }, {
    key: 'helperFactory',
    value: function helperFactory(relativePath) {
      var self = this;
      return function (name) {
        return self.useHelper(name, relativePath);
      };
    }
  }, {
    key: 'writeHelperFile',
    value: function writeHelperFile(path) {
      fs.writeFileSync(path, printAst(this.getUsedMethods()));
    }
  }, {
    key: 'shouldRewriteTempFile',
    get: function get() {
      return !this._helperFileExist && this._invalidTempFile;
    }
  }, {
    key: 'helperAbsPath',
    get: function get() {
      var filename = this.helperFilename;
      if (!path.isAbsolute(filename)) {
        return path.join(process.cwd(), filename);
      }
      return filename;
    }
  }, {
    key: 'helperFilename',
    set: function set(helperFilename) {
      var last = this._helperFilename,
          current = helperFilename || DEF_HELPER_FILE_PATH;
      if (last !== current) {
        this._helperFilename = this.checkHelperPath(current);
      }
    },
    get: function get() {
      return this._helperFilename;
    }
  }]);

  return HelperRemap;
}();

var babelRegistered = undefined;
function registerBabel(babelCore) {
  if (!babelRegistered) {
    babel = babelCore;
    var _babel = babel;
    var template = _babel.template;
    var types = _babel.types;

    StringLiteral = types.StringLiteral;
    Identifier = types.Identifier;
    File = babel.File;
    Program = types.Program;
    helperDefineTemplate = template('exports.METHOD_NAME=METHOD');
    helperRequireTemplate = template('require(HELPER_NAMESPACE).METHOD_NAME');
    helperImportTemplate = template('require(HELPER_NAMESPACE)');
    traverse.registerBabel(babelCore);
  }
  babelRegistered = true;
}
function getRelativePath(from, to) {
  var relativePath = path.relative(path.dirname(from), to);
  if (relativePath[0] !== '.') {
    relativePath = '.' + path.sep + relativePath;
  }
  return relativePath;
}
function traverseExportNames(topNode) {
  var names = [];
  traverse.cheapTraverse(topNode, function (node) {
    var left = undefined;
    if (node.type == 'AssignmentExpression' && (left = node.left).type == 'MemberExpression') {
      var _left = left;
      var object = _left.object;
      var property = _left.property;

      if (object.type == 'Identifier' && object.name == 'exports' && property.type == 'Identifier') {
        if (names.indexOf(property.name == -1)) {
          names.push(property.name);
        }
        return false;
      }
    }
  });
  return names;
}
function printAst(asts) {
  var file = new File({ compact: true });
  file.addAst(babel.types.File(Program(asts)));
  return file.generate().code;
}