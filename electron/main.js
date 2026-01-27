const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow = null;
let tray = null;
let isQuitting = false;

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Set App User Model ID for Windows notifications
// This makes notifications show "Task Checker" instead of "electron.app.task checker"
if (process.platform === 'win32') {
    app.setAppUserModelId('Task Checker');
}

// MIME types for serving local files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.txt': 'text/plain'
};

function getAssetPath(...paths) {
    // In production with asar disabled, resources are in resources/app folder
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'app', ...paths);
    }
    return path.join(__dirname, '..', ...paths);
}

function createWindow() {
    // Get icon path
    const iconPath = getAssetPath('build', 'icon.png');

    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: iconPath,
        backgroundColor: '#09090b',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        // Custom title bar styling
        titleBarStyle: 'default',
        autoHideMenuBar: true
    });

    // Load the app
    if (isDev) {
        // In development, load from Next.js dev server
        mainWindow.loadURL('http://localhost:3000');
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load from custom protocol
        mainWindow.loadURL('app://./index.html');
    }

    // Handle load errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close - minimize to tray instead
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();

            // Show notification on first minimize
            if (Notification.isSupported()) {
                new Notification({
                    title: 'Task Checker',
                    body: 'App minimized to system tray. Click the tray icon to restore.',
                    icon: iconPath
                }).show();
            }
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    const iconPath = getAssetPath('build', 'icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

    tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Task Checker',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Start with Windows',
            type: 'checkbox',
            checked: app.getLoginItemSettings().openAtLogin,
            click: (menuItem) => {
                app.setLoginItemSettings({
                    openAtLogin: menuItem.checked
                });
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Task Checker');
    tray.setContextMenu(contextMenu);

    // Double-click to show window
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

// Handle showing notifications from renderer
ipcMain.handle('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        const iconPath = getAssetPath('build', 'icon.png');
        new Notification({
            title: title || 'Task Checker',
            body: body,
            icon: iconPath
        }).show();
    }
});

// Register custom app:// protocol before app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    // Register the custom app:// protocol handler in production
    if (!isDev) {
        protocol.handle('app', (request) => {
            const url = request.url.slice('app://./'.length);
            const outPath = getAssetPath('out');
            let filePath;

            if (url === '' || url === '/' || url === 'index.html') {
                filePath = path.join(outPath, 'index.html');
            } else {
                // Handle URL path
                filePath = path.join(outPath, decodeURIComponent(url));
            }

            // Check if file exists
            try {
                if (!fs.existsSync(filePath)) {
                    console.error('File not found:', filePath);
                    return new Response('Not Found', { status: 404 });
                }

                const data = fs.readFileSync(filePath);
                const ext = path.extname(filePath).toLowerCase();
                const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

                return new Response(data, {
                    headers: { 'Content-Type': mimeType }
                });
            } catch (err) {
                console.error('Error reading file:', filePath, err);
                return new Response('Error reading file', { status: 500 });
            }
        });
    }

    createWindow();
    createTray();

    app.on('activate', () => {
        // On macOS, re-create window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else if (mainWindow) {
            mainWindow.show();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle before-quit to actually quit the app
app.on('before-quit', () => {
    isQuitting = true;
});

// Handle second instance - focus existing window
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });
}
