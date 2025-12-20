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

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

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

app.whenReady().then(createWindow)
