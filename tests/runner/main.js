'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('electron').ipcMain;
var path = require('path');
var renderer_test_exit_status = 0;

function openElectronWindow() {
    let w = new BrowserWindow({width: 800, height: 600});
    let html = 'file://' + path.resolve(__dirname, 'index.html');
    w.on('closed', function() { process.exit(0) });
    w.webContents.on('dom-ready', function(){ 
        w.openDevTools();
    });
    w.loadURL(html);

    ipc.on('renderer-test-result', function(event, exit_status){
        renderer_test_exit_status = exit_status;
        app.quit();
    });
    
    ipc.on('renderer-print-message', function(event, message){
        process.send(message);
    });
}

app.on('ready', function() {
    openElectronWindow();

    process.on('exit', function() {
        process.exit(renderer_test_exit_status);
    });
});