let path = require('path');
let electron = require('electron');

let win = null;
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;

app.on('ready', function () {
  win = new BrowserWindow({
    width: 800,
    height: 900,
    titleBarStyle: 'hidden'
  });

  win.loadURL('file://' + path.join(__dirname, 'index.html'));
  win.on('close', function () {
    win = null
  });
  win.show();
  win.webContents.openDevTools();
})
