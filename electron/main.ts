import { app, BrowserWindow, ipcMain, Notification, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─ dist
// │ ├─┬─ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │ └── assets
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

// Register scheme 'zapfood'
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("zapfood", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("zapfood");
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();

      // Handle deep link on Windows / Linux
      const url = commandLine.find((arg) => arg.startsWith("zapfood://"));
      if (url) {
        handleDeepLink(url);
      }
    }
  });

  // Create window only if we got the lock
  app.whenReady().then(createWindow);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1440,
    minHeight: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:zapfood", // Sessão persistente
      devTools: true, // DevTools sempre habilitado
      webSecurity: true, // Importante para cookies funcionarem corretamente
    },
    frame: false, // Frameless for custom titlebar
    titleBarStyle: "hidden",
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Handle deep link on macOS
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Handle deep link on Windows/Linux (via second-instance)
function handleDeepLink(url: string) {
  if (!win) return;

  if (win.isMinimized()) win.restore();
  win.focus();

  // Enviar deep link para o renderer processar
  win.webContents.send("deep-link", url);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

ipcMain.on("window-minimize", () => {
  win?.minimize();
});

ipcMain.handle("window-maximize", () => {
  if (win?.isMaximized()) {
    win?.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on("window-close", () => {
  win?.close();
});

ipcMain.handle("window-is-maximized", () => {
  return win?.isMaximized();
});

ipcMain.on("shell-open-external", (_, url: string) => {
  shell.openExternal(url);
});

// Handle native notifications (silent, without default Windows sound)
ipcMain.handle(
  "notification-show",
  (
    _,
    options: { title: string; body: string; icon?: string; tag?: string }
  ) => {
    if (!Notification.isSupported()) {
      return { success: false, error: "Notifications not supported" };
    }

    const notificationOptions: Electron.NotificationConstructorOptions = {
      title: options.title,
      body: options.body,
      silent: true, // This disables the default Windows notification sound
    };

    if (options.icon) {
      notificationOptions.icon = options.icon;
    }

    const notification = new Notification(notificationOptions);

    notification.show();

    notification.on("click", () => {
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
      }
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return { success: true };
  }
);

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
