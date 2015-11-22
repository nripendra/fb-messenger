'use strict';

var atom = require('gulp-atom'),
    babel = require("gulp-babel"),
    babelify = require("babelify"),
    Browserify = require('browserify'),
    Config = require('./gulpfile.config'),
    del = require('del'),
    electron = require('gulp-electron'),
    glob = require('glob'),
    gulp = require('gulp'),
    inject = require('gulp-inject'),
    inno = require('gulp-inno'),
    insert = require('gulp-insert'),
    jasmine = require('gulp-jasmine'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    replace = require('gulp-batch-replace'),
    runSequence = require('run-sequence'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    spawn = require('child_process').spawn,
    tsc = require('gulp-typescript'),
    transform = require('vinyl-transform'),
    typescript = require('typescript'),
    zip = require('gulp-zip');

var config = new Config();
var tsconfig = tsc.createProject('tsconfig.json', {typescript: typescript});
var packageJson = require('./package.json');

gulp.task('copy-jsx-test', function () {
    return gulp.src("./src/**/*.jsx")
        .pipe(babel({stage: 0}))
        .pipe(gulp.dest("./tests/out/src/"));
});

gulp.task('compile-test', ['copy-jsx-test'], function(){
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

gulp.task('copy-jsx', function () {
    return gulp.src(config.source + '**/*.jsx')
        .pipe(babel({stage: 0}))
        .pipe(gulp.dest(config.tsOutputPath))
});

gulp.on('err', function(e) {
  console.log(e.err.stack);
});

gulp.task('browserify-bundle', ['copy-jsx','compile-ts'], function (cb) {
    var babelifyStep = babelify.configure({stage: 0});

    var allFiles = glob.sync(config.tsOutputPath + "**/*.{js,jsx}", {ignore: [config.tsOutputPath + 'index.js', config.tsOutputPath + 'stdio-redirect.js']});
    var bundler = new Browserify({
        entries: allFiles,
        transform: [ babelifyStep ]
    });
        return bundler
        .bundle()
        .pipe(source('program.js'))
        .pipe(gulp.dest(config.compiled));
});

gulp.task('browserify-copy_node_modules', function () {
    return gulp.src(['./node_modules/facebook-chat-api/**/*'], { "base" : "." })
        .pipe(gulp.dest('./out/compile/'));
});

gulp.task('browserify', function (cb) {
    return runSequence('browserify-bundle' ,'browserify-copy_node_modules', cb);
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

gulp.task('min-emoji', function () {
    return gulp.src(config.source + 'styles/min-emoji/**/*.*')
        .pipe(gulp.dest(config.compiled + '/styles/min-emoji'));
});

gulp.task('3rd-party-assets', ['font-awesome', 'min-emoji']);

gulp.task('copy-static', function () {
    gulp.src('./out/js/index.js')
        .pipe(babel({stage: 0}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.compiled));
        
   gulp.src('./out/js/stdio-redirect.js')
        .pipe(babel({stage: 0}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.compiled));

    return gulp.src(['./src/index.html', './package.json'])
        .pipe(gulp.dest(config.compiled));
});

var electronVersion = 'v0.34.3';

gulp.task('atom-kill', function (cb) {
    if(process.platform == 'win32'){
        spawn('taskkill', ["/im", "fb-messenger.exe", "/f", "/t"]);
    } else {
        spawn('killall', ['-I', '-w', 'fb-messenger.exe']);
    }
    cb();
});

gulp.task('atom-clean', ['atom-kill'], function(cb){
    return del('./electron/build/**/*.*', cb);
});

gulp.task('atom-create', ['atom-clean', 'browserify', 'copy-static'], function () {
    return gulp.src("")
    .pipe(electron({
        src: './out/compile',
        packageJson: packageJson,
        release: './electron/build',
        cache: './electron/cache',
        version: electronVersion,
        packaging: false,
        asar: true,
        platforms: ['win32-ia32'],//, 'darwin-x64'],
        platformResources: {
            // darwin: {
            //     CFBundleDisplayName: packageJson.name,
            //     CFBundleIdentifier: packageJson.name,
            //     CFBundleName: packageJson.name,
            //     CFBundleVersion: packageJson.version,
            //     icon: 'fb-messenger.icns'
            // },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'fb-messenger.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
    // return atom({
    //     srcPath: './out/compile',
    //     releasePath: './electron/build',
    //     cachePath: './electron/cache',
    //     version: electronVersion,
    //     rebuild: false,
    //     asar: true,
    //     platforms: ['win32-ia32']
    // });
});

gulp.task('atom', ['less', '3rd-party-assets'], function (cb) {
    return runSequence('atom-clean','atom-create', cb);
});

gulp.task('atom-run', ['atom'], function (cb) {
    var child = spawn('./electron/build/' + electronVersion + '/win32-ia32/fb-messenger.exe', []);
    cb();
});

gulp.task('watch', function () {
    gulp.watch([config.allTypeScript, config.source + '**/*.jsx'], ['run']);
});

gulp.task('inno-script-transform',  function(){
    return gulp.src('./installer_script.iss').pipe(replace([
        ["{{appname}}", packageJson.name], 
        ["{{appver}}", packageJson.version],
        ["{{outputfilename}}", packageJson.name + "-setup"],
        ["{{OutputDir}}", "./installer"],
        ["{{PackageFiles}}", "./electron/build/" + electronVersion + "/win32-ia32/*.*"]
        ]))
    .pipe(rename("installer_script.temp.iss"))
    .pipe(gulp.dest('./'));
});

gulp.task('inno-script-exec', function(){
    return gulp.src('./installer_script.temp.iss')
               .pipe(inno());
});

gulp.task('build', function(cb) {
    return runSequence('test','browserify', 'copy-static', 'less', '3rd-party-assets', cb);
});

gulp.task('package-win32', ['build'], function(cb){
     return runSequence('atom', 'inno-script-transform', 'inno-script-exec', function(){
         console.log("deleting temporary installer_script...");
         del('./installer_script.temp.iss');
         
         if(cb) cb();
     });
});

gulp.task('run',  function(cb) {
    return runSequence('atom-run', 'watch', cb);
});

gulp.task('default', ['build']);
