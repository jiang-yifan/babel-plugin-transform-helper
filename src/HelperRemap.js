import * as babelHelpers from "babel-helpers";
import * as path from 'path';
import * as fs from 'fs';
let babel, helperDefineTemplate, helperImportTemplate, helperRequireTemplate, StringLiteral, Identifier, File, Program;
let DEF_HELPER_FILE_PATH = '__temp_helper_file.js';
export class HelperRemap {
  constructor(babelCore){
    this.usedHelpers = [];
    registerBabel(babelCore);
  }

  get shouldRewriteTempFile(){
    return !this._helperFileExist && this._invalidTempFile;
  }

  get helperAbsPath(){
    let filename = this.helperFilename;
    if (!path.isAbsolute(filename)) {
      return path.join(process.cwd(), filename);
    }
    return filename;
  }

  set helperFilename(helperFilename){
    let last = this._helperFilename, current = helperFilename || DEF_HELPER_FILE_PATH;
    if (last !== current) {
      this._helperFilename = this.checkHelperPath(current)
    }
  }

  get helperFilename(){
    return this._helperFilename;
  }

  isHelperFile(sourcePath){
    return sourcePath == this.helperAbsPath && this._helperFileExist
  }

  useHelper(name, relativePath){
    let { usedHelpers }=this;
    if (usedHelpers.indexOf(name) == -1) {
      usedHelpers.push(name);
      this._invalidTempFile = true;
    }
    return helperRequireTemplate({
      HELPER_NAMESPACE: StringLiteral(relativePath),
      METHOD_NAME: Identifier(name)
    }).expression;
  }

  getUsedMethods(){
    return this.usedHelpers.map(name=>helperDefineTemplate({
      METHOD_NAME: Identifier(name),
      METHOD: babelHelpers.get(name)
    }))
  }

  checkHelperPath(filename){
    if (!filename) {
      throw Error('filename empty');
    }
    if (path.extname(filename) !== '.js') {
      filename = filename + '.js';
    }
    try {
      fs.statSync(filename);
      this._helperFileExist = true;
    }
    catch (ex) {
      this._helperFileExist = false;
    }
    return filename;
  }

  helperFactory(relativePath){
    let self = this;
    return (name)=>self.useHelper(name, relativePath)
  }

  writeHelperFile(path){
    fs.writeFileSync(path, printAst(this.getUsedMethods()))
  }
}
let babelRegistered;
export function registerBabel(babelCore){
  if (!babelRegistered) {
    babel = babelCore;
    let {template,types}=babel;
    StringLiteral = types.StringLiteral;
    Identifier = types.Identifier;
    File = babel.File;
    Program = types.Program;
    helperDefineTemplate = template(`exports.METHOD_NAME=METHOD`);
    helperRequireTemplate = template(`require(HELPER_NAMESPACE).METHOD_NAME`);
    helperImportTemplate = template(`require(HELPER_NAMESPACE)`);
  }
  babelRegistered = true;
}
export function getRelativePath(from, to){
  let relativePath = path.relative(path.dirname(from), to);
  if (relativePath[0] !== '.') {
    relativePath = '.' + path.sep + relativePath;
  }
  return relativePath;
}
function printAst(asts){
  let file = new File({ compact: true });
  file.addAst(babel.types.File(Program(asts)));
  return file.generate().code;
}