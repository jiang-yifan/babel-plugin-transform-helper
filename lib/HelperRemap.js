'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HelperRemap = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _register = require('./register');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var babel = void 0,
    helperDefineTemplate = void 0,
    helperImportTemplate = void 0,
    helperRequireTemplate = void 0,
    StringLiteral = void 0,
    Identifier = void 0,
    File = void 0,
    Program = void 0;
var DEF_HELPER_FILE_PATH = './__temp_bundle_helpers.js';

var HelperRemap = exports.HelperRemap = function () {
  function HelperRemap(babelCore) {
    _classCallCheck(this, HelperRemap);

    this.usedHelpers = [];
    this._definedHelpers = {};
    this._extractRules = [];
    registerBabel(babelCore);
  }

  _createClass(HelperRemap, [{
    key: 'isHelperFile',
    value: function isHelperFile(sourcePath) {
      return normalizePath(sourcePath) == normalizePath(this.helperAbsPath);
    }
  }, {
    key: 'removeTempFile',
    value: function removeTempFile() {
      var absPath = path.join(process.cwd(), DEF_HELPER_FILE_PATH);
      try {
        fs.unlinkSync(absPath);
        return true;
      } catch (ex) {
        return false;
      }
    }
  }, {
    key: 'useHelper',
    value: function useHelper(name, relativePath) {
      var usedHelpers = this.usedHelpers;

      if (usedHelpers.indexOf(name) == -1) {
        usedHelpers.push(name);
        //this.removeTempFile();
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
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          exclude = _ref.exclude;

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
            var METHOD = this._definedHelpers[name] || babelHelpers.get(name);
            ret.push(helperDefineTemplate({
              METHOD_NAME: Identifier(name),
              METHOD: METHOD
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
    key: 'defineHelper',
    value: function defineHelper(name, node) {
      if (babel.types.isNode(node)) {
        this._definedHelpers[name] = node;
      } else {
        throw Error('not a Node');
      }
    }
  }, {
    key: 'checkHelperPath',
    value: function checkHelperPath(filename) {
      if (!filename) {
        throw Error('filename empty');
      }
      filename = './' + filename.replace(/\\/g, '/');
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
      fs.writeFileSync(path, (0, _register.printAst)(this.getUsedMethods()));
    }
  }, {
    key: 'shouldExtract',
    value: function shouldExtract(name) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._extractRules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var rule = _step2.value;

          if (rule(name)) {
            return true;
          }
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

      return false;
    }
  }, {
    key: 'addExtractRule',
    value: function addExtractRule(text) {
      var rule = parseTestFunction(text);
      if (rule) {
        this._extractRules.push(rule);
        return rule;
      }
    }
  }, {
    key: 'shouldRewriteTempFile',
    get: function get() {
      return !this._helperFileExist || this._invalidTempFile;
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

var babelRegistered = void 0;
function registerBabel(babelCore) {
  if (!babelRegistered) {
    babel = babelCore;
    var _babel = babel,
        template = _babel.template,
        types = _babel.types;

    StringLiteral = types.StringLiteral;
    Identifier = types.Identifier;
    File = babel.File;
    Program = types.Program;
    helperDefineTemplate = template('exports.METHOD_NAME=METHOD');
    helperRequireTemplate = template('require(HELPER_NAMESPACE).METHOD_NAME');
    helperImportTemplate = template('require(HELPER_NAMESPACE)');
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
  (0, _register.cheapTraverse)(topNode, function (node) {
    var left = void 0;
    if (node.type == 'AssignmentExpression' && (left = node.left).type == 'MemberExpression') {
      var _left = left,
          object = _left.object,
          property = _left.property;

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
function parseTestFunction(text) {
  switch (typeof text === 'undefined' ? 'undefined' : _typeof(text)) {
    case 'function':
      return function (name) {
        return text(name);
      };
    case 'string':
      if (/^\/.+\/$/.test(text)) {
        var regExp = new RegExp(text.substring(1, text.length - 1));
        return function (name) {
          return regExp.test(name);
        };
      }
      return function (name) {
        return name === text;
      };
    default:
      if (text instanceof RegExp) {
        return function (name) {
          return text.test(name);
        };
      }
      return;
  }
}
function normalizePath(p) {
  return path.normalize(p).replace(/^[A-Z]+:/, function (str) {
    return str.toLowerCase();
  });
}