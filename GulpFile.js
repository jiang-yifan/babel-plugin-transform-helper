"use strict";
let watchify = require('gulp-watchify');
let babel = require('gulp-babel');
let gulp = require('gulp');

gulp.task('browser', browserifyScripts({
  src: 'temp/t1/Rect.js',
  dest: 'temp/build/t1',
  extractVariables: '/__\\w+/'
}));
gulp.task('extract', browserifyScripts({
  src: 'temp/extract/index.js',
  dest: 'temp/build/extract',
  extractVariables: '/__\\w+/',
  helperFilename: 'temp/extract-helper.js'
}));
gulp.task('angular', browserifyScripts({
  src: 'temp/angular2/core.js',
  dest: 'temp/build/angular2',
  extractVariables: '/__\\w+/'
}));
gulp.task('build:src', function (){
  return gulp.src(['src/**/*.js']).pipe(babel({
    presets: ['es2015']
  })).pipe(gulp.dest('lib'))
});
gulp.task('watch:src', ['build:src'], function (){
  return gulp.watch(['src/**/*.js'], ['build:src'])
});
function browserifyScripts(options){
  return watchify(function (watchify){
    return gulp.src(options.src)
      .pipe(watchify({
        watch: !!options.watch,
        setup(bundle){
          bundle.transform('babelify', {
            presets: ['es2015'],
            compact: true,
            comments: false,
            sourceMaps: 'inline',
            plugins: [
              [require('./lib/index.js').default, {
                helperFilename: options.helperFilename,
                extractVariables: options.extractVariables
              }]
            ]
          });
        }
      })).pipe(gulp.dest(options.dest));
  })
}