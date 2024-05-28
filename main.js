const { app, BrowserWindow, Tray, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'chat.png'),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadURL('https://trello.com');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
      });

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    });
}

app.on('ready', () => {
    createWindow();

    tray = new Tray(path.join(__dirname, 'trello.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Reload',
            click: () => { mainWindow.reload(); }
        },
        {
            label: 'Close',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Trello');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
