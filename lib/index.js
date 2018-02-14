'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (babel) {
  (0, _register.register)(babel);
  var remap = new _HelperRemap.HelperRemap(babel),
      clearTempFile = void 0;
  return {
    pre: function pre(file) {
      var _opts = this.opts,
          helperFilename = _opts.helperFilename,
          extractVariables = _opts.extractVariables;

      if (!helperFilename && !clearTempFile) {
        //remove previous temple file
        remap.removeTempFile();
        clearTempFile = true;
      }
      remap.helperFilename = helperFilename;
      var sourcePath = file.opts.filename,
          helperAbsPath = remap.helperAbsPath,
          relativePath = void 0;
      if (sourcePath !== helperAbsPath && !remap.isHelperFile(sourcePath)) {
        relativePath = (0, _HelperRemap.getRelativePath)(sourcePath, helperAbsPath).replace(/\\/g, '/');
        file.set('helperGenerator', remap.helperFactory(relativePath));
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _register.makeArr)(extractVariables)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var extractRule = _step.value;

          remap.addExtractRule(extractRule);
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
    },
    post: function post() {
      if (remap.shouldRewriteTempFile) {
        remap.writeHelperFile(remap.helperAbsPath);
        remap._invalidTempFile = false;
      }
    },

    visitor: {
      VariableDeclarator: function VariableDeclarator(path) {
        var id = path.get('id').node;
        if (id.type == 'Identifier' && remap.shouldExtract(id.name)) {
          remap.defineHelper(id.name, path.get('init').node);
          path.remove();
        }
      },
      Identifier: function Identifier(path) {
        var generator = this.file.get('helperGenerator'),
            name = path.node.name;
        if ((0, _register.isRefIdentifier)(path) && generator && remap.shouldExtract(name)) {
          path.replaceWith(generator(name));
        }
      },

      Program: {
        exit: function exit(path) {
          if (remap.isHelperFile(this.file.opts.filename)) {
            var exclude = (0, _HelperRemap.traverseExportNames)(path.node);
            path.pushContainer('body', remap.getUsedMethods({ exclude: exclude }));
          }
        }
      }
    }
  };
};

var _HelperRemap = require('./HelperRemap');

var _register = require('./register');