'use strict';

var atom = require('gulp-atom'),
    babel = require("gulp-babel"),
    babelify = require("babelify"),
    Browserify = require('browserify'),
    Config = require('./gulpfile.config'),
    del = require('del'),
    glob = require('glob'),
    gulp = require('gulp'),
    inject = require('gulp-inject'),
    insert = require('gulp-insert'),
    jasmine = require('gulp-jasmine'),
    less = require('gulp-less'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    spawn = require('child_process').spawn,
    tsc = require('gulp-typescript'),
    transform = require('vinyl-transform'),
    typescript = require('typescript');

var config = new Config();
var tsconfig = tsc.createProject('tsconfig.json', {typescript: typescript});

gulp.task('compile-test', function(){
  var sourceTsFiles = ["./tests/specs/**/*.{ts,tsx}",
  "./tools/typings/**/*.ts",
  "./src/**/*.{ts,tsx}",
  config.appTypeScriptReferences];

  var tsResult = gulp.src(sourceTsFiles)
      .pipe(tsc(tsconfig));

  tsResult.dts.pipe(gulp.dest("./tests/out/"));

  return tsResult.js
      .pipe(babel({stage: 0}))
      .pipe(gulp.dest("./tests/out/"))
});

gulp.task('test', ['compile-test'], function(){
  process.env.NODE_ENV = 'development';
  return gulp.src('./tests/out/tests/specs/**/*.js')
      .pipe(jasmine({includeStackTrace: true}));
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
    var typeScriptGenFiles = [config.tsOutputPath + '**/*.*'];

    // delete the files
    del(typeScriptGenFiles, cb);
    cb();
});

/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
gulp.task('gen-ts-refs', ['clean-ts'], function () {
    var target = gulp.src(config.appTypeScriptReferences);
    var sources = gulp.src(config.allTypeScript, {read: false});
    return target.pipe(inject(sources, {
        starttag: '//{',
        endtag: '//}',
        transform: function (filepath) {
            return '/// <reference path="../..' + filepath + '" />';
        }
    })).pipe(gulp.dest(config.typings));
});

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', ['gen-ts-refs'], function () {
    var sourceTsFiles = [config.allTypeScript,                //path to typescript files
        config.libraryTypeScriptDefinitions, //reference to library .d.ts files
        config.appTypeScriptReferences];     //reference to app.d.ts files

    var tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc(tsconfig));

    tsResult.dts.pipe(gulp.dest(config.tsOutputPath));

    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.tsOutputPath))
});

gulp.task('append-runner', ['compile-ts'], function () {
    return gulp.src(config.tsOutputPath + "program.js")
        .pipe(insert.append('\n\ndocument.addEventListener("DOMContentLoaded", function(e){require("./Program").main();});'))
        .pipe(gulp.dest(config.tsOutputPath))
});

gulp.task('browserify', ['append-runner'], function () {
    var babelifyStep = babelify.configure({stage: 0});

    var allFiles = glob.sync(config.tsOutputPath + "**/*.js", {ignore: config.tsOutputPath + 'index.js'});
    var bundler = new Browserify({
        entries: allFiles,
        transform: [ babelifyStep ]
    });
    return bundler
        .bundle()
        .pipe(source('program.js'))
        .pipe(gulp.dest(config.compiled));
});

gulp.task('less', function () {
    return gulp.src(config.source + 'styles/**/*.less')
        .pipe(less())
        .pipe(gulp.dest(config.compiled + '/styles'));
});

gulp.task('font-awesome', function () {
    return gulp.src(config.source + 'styles/font-awesome/**/*.*')
        .pipe(gulp.dest(config.compiled + '/styles/font-awesome'));
});

gulp.task('copy-static', ['compile-ts'], function () {
    gulp.src('./out/js/index.js')
        .pipe(babel({stage: 0}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.compiled));

    return gulp.src(['./src/index.html', './package.json'])
        .pipe(gulp.dest(config.compiled));
});

gulp.task('atom', ['browserify', 'copy-static'], function () {
    return atom({
        srcPath: './out/compile',
        releasePath: './electron/build',
        cachePath: './electron/cache',
        version: 'v0.26.1',
        rebuild: false,
        asar: true,
        platforms: ['win32-ia32']
    });
});

gulp.task('atom-run', ['atom'], function (cb) {
    var child = spawn('./electron/build/v0.26.1/win32-ia32/electron.exe', []);
    cb();
});

gulp.task('watch', function () {
    gulp.watch([config.allTypeScript], ['less', 'font-awesome', 'browserify', 'atom']);
});

gulp.task('default', ['less', 'font-awesome', 'browserify', 'atom', 'atom-run', 'watch']);
