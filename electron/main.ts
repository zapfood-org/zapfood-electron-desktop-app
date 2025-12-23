import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ ├─┬─ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │ └── assets
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// Register scheme 'zapfood'
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('zapfood', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('zapfood')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (_event, commandLine, _workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()

            // Handle deep link on Windows / Linux
            const url = commandLine.find((arg) => arg.startsWith('zapfood://'));
            if (url) {
                win.webContents.send('deep-link', url);
            }
        }
    })

    // Create window only if we got the lock
    app.whenReady().then(createWindow)
}

function createWindow() {
    const isDev = !!VITE_DEV_SERVER_URL;

    win = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1440,
        minHeight: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            partition: 'persist:zapfood', // Sessão persistente
            devTools: isDev, // Desabilita DevTools em produção
        },
        frame: false, // Frameless for custom titlebar
        titleBarStyle: 'hidden',
    })

    // Desabilitar DevTools em produção
    if (!isDev) {
        // Fechar DevTools se alguém tentar abrir
        win.webContents.on('devtools-opened', () => {
            win?.webContents.closeDevTools()
        })

        // Bloquear menu de contexto (botão direito) em produção
        win.webContents.on('context-menu', (event) => {
            event.preventDefault()
        })

        // Bloquear atalhos de teclado do DevTools em produção
        win.webContents.on('before-input-event', (event, input) => {
            // Bloquear F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
            if (
                input.key === 'F12' ||
                (input.control && input.shift && (input.key === 'I' || input.key === 'J' || input.key === 'C')) ||
                (input.control && input.key === 'U')
            ) {
                event.preventDefault()
            }
        })
    }

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    // Lida com URLs que abrem novas janelas (como OAuth)
    // Lida com URLs que abrem novas janelas (como OAuth)
    win.webContents.setWindowOpenHandler(({ url }) => {
        // Permitir fluxo de auth interno (Google ou Backend Auth)
        if (url.includes('accounts.google.com') || url.includes('/auth/') || url.includes('sign-in')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    autoHideMenuBar: true,
                    width: 580,
                    height: 740,
                    resizable: false,
                    center: true,
                    alwaysOnTop: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        // Partition MUST match the main window to share cookies
                        partition: 'persist:zapfood'
                    }
                }
            };
        }

        // Permitir abrir urls externas no navegador padrão
        if (url.startsWith('https:') || url.startsWith('http:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // Monitorar criação de janelas (Popups) para interceptar o callback
    win.webContents.on('did-create-window', (childWindow, { url: _url }) => {
        // Interceptar navegação na janela filha
        childWindow.webContents.on('will-navigate', (_e, navUrl) => {
            handleAuthCallback(navUrl, childWindow);
        });

        childWindow.webContents.on('will-redirect', (_e, navUrl) => {
            handleAuthCallback(navUrl, childWindow);
        });

        // Também verificar a URL inicial ou carregamento
        childWindow.webContents.on('did-finish-load', () => {
            handleAuthCallback(childWindow.webContents.getURL(), childWindow);
        });
    });

    function handleAuthCallback(urlStr: string, childWindow: BrowserWindow) {
        // Verificar se chegou na URL de sucesso "fake" ou real que definirmos
        if (urlStr.includes('/auth-success') || urlStr.includes('zapfood://auth')) {
            if (!childWindow.isDestroyed()) {
                childWindow.close();
            }
            // Notificar janela principal para recarregar sessão
            win?.webContents.send('auth-success');
        }
    }

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

// Handle deep link on macOS
app.on('open-url', (event, url) => {
    event.preventDefault()
    if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
        win.webContents.send('deep-link', url);
    }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

ipcMain.on('window-minimize', () => {
    win?.minimize()
})

ipcMain.handle('window-maximize', () => {
    if (win?.isMaximized()) {
        win?.unmaximize()
    } else {
        win?.maximize()
    }
})

ipcMain.on('window-close', () => {
    win?.close()
})

ipcMain.handle('window-is-maximized', () => {
    return win?.isMaximized()
})

ipcMain.on('shell-open-external', (_, url: string) => {
    shell.openExternal(url)
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
