import {HelperRemap, getRelativePath, traverseExportNames} from './HelperRemap';
import {register, makeArr, isRefIdentifier} from './register';
export default function (babel){
  register(babel);
  let remap = new HelperRemap(babel), clearTempFile;
  return {
    pre(file){
      let { helperFilename, extractVariables }= this.opts;
      if (!helperFilename && !clearTempFile) {
        //remove previous temple file
        remap.removeTempFile();
        clearTempFile = true;
      }
      remap.helperFilename = helperFilename;
      let sourcePath = file.opts.filename, helperAbsPath = remap.helperAbsPath, relativePath;
      if (sourcePath !== helperAbsPath) {
        relativePath = getRelativePath(sourcePath, helperAbsPath).replace(/\\/g,'/');
        file.set('helperGenerator', remap.helperFactory(relativePath));
      }
      for (let extractRule of makeArr(extractVariables)) {
        remap.addExtractRule(extractRule)
      }
    },
    post(){
      if (remap.shouldRewriteTempFile) {
        remap.writeHelperFile(remap.helperAbsPath);
        remap._invalidTempFile = false;
      }
    },
    visitor: {
      VariableDeclarator(path){
        let id = path.get('id').node;
        if (id.type == 'Identifier' && remap.shouldExtract(id.name)) {
          remap.defineHelper(id.name, path.get('init').node);
          path.remove();
        }
      },
      Identifier(path){
        let generator = this.file.get('helperGenerator'), name = path.node.name;
        if (isRefIdentifier(path) && generator && remap.shouldExtract(name)) {
          path.replaceWith(generator(name))
        }
      },
      Program: {
        exit(path){
          if (remap.isHelperFile(this.file.opts.filename)) {
            let exclude = traverseExportNames(path.node);
            path.pushContainer('body', remap.getUsedMethods({ exclude }));
          }
        }
      }
    }
  }
}
