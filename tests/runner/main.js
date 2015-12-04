'use strict';

(function () {
    var app = require('app');
    var BrowserWindow = require('browser-window');
    var ipc = require('electron').ipcMain;
    var path = require('path');
    var renderer_test_exit_status = 0;

    function openElectronWindow() {
        var w = new BrowserWindow({ width: 800, height: 600, x: -800, y: -600, 'title-bar-style': 'hidden', transparent: true, frame: false, skipTaskbar: true });
        var html = 'file://' + path.resolve(__dirname, 'index.html');

        w.on('closed', function () {
            process.exit(renderer_test_exit_status)
        });

        w.webContents.on('dom-ready', function () {
            w.openDevTools();
        });

        ipc.on('renderer-test-result', function (event, exit_status) {
            renderer_test_exit_status = exit_status;
            app.quit();
        });

        ipc.on('renderer-print-message', function (event, message) {
            process.send(message);
        });

        w.loadURL(html);
    }

    app.on('ready', function () {
        openElectronWindow();

        process.on('exit', function () {
            process.exit(renderer_test_exit_status);
        });
    });
})();