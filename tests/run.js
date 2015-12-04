'use strict';

var electron = require('electron-prebuilt');
var spawn = require('child_process').spawn;
var join = require('path').join;

var args = process.argv.slice(2)
var idx_travis = args.indexOf('--travis');
var on_travis = idx_travis !== -1;

if (on_travis) {
    args.splice(idx_travis, 1);
}

function runOnElectron(tests) {
    var args = [join(__dirname, 'runner')].concat(tests);
    if (on_travis) {
        args.push('--travis');
    }

    var proc = spawn(electron, args, { 'encoding': 'ansi', stdio: [null, null, null, 'ipc'] });

    proc.on('exit', function (exitCode) {
        console.log("Exiting... %d", exitCode);
        process.exit(exitCode);
    });

    proc.on('message', function (e) {
        console.log(e || "");
    });
}

if (args.length === 0) {
    runOnElectron([join(__dirname, 'browser', 'out'), join(__dirname, 'out')]);
} else {
    runOnElectron(args);
}