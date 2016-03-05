import  { HelperRemap ,getRelativePath } from './HelperRemap';
export default function (babel){
  let remap = new HelperRemap(babel);
  return {
    pre(file){
      remap.helperFilename = this.opts.helperFilename;
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
            path.pushContainer('body', remap.getUsedMethods());
          }
        }
      }
    }
  }
}