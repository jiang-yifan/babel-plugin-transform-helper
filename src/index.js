import  { HelperRemap ,getRelativePath, traverseExportNames } from './HelperRemap';
export default function (babel){
  let remap = new HelperRemap(babel), clearTempFile;
  return {
    pre(file){
      let { helperFilename }= this.opts;
      if (!helperFilename && !clearTempFile) {
        //remove previous temple file
        remap.removeTempFile();
        clearTempFile = true;
      }
      remap.helperFilename = helperFilename;
      let sourcePath = file.opts.filename, helperAbsPath = remap.helperAbsPath, relativePath;
      if (sourcePath !== helperAbsPath) {
        relativePath = getRelativePath(sourcePath, helperAbsPath);
        file.set('helperGenerator', remap.helperFactory(relativePath));
      }
    },
    post(){
      if (remap.shouldRewriteTempFile) {
        remap.writeHelperFile(remap.helperAbsPath);
        remap._invalidTempFile = false;
      }
    },
    visitor: {
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