import { app, BrowserWindow, ipcMain, Notification, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

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
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();

      const url = commandLine.find((arg) => arg.startsWith("zapfood://"));
      if (url) {
        handleDeepLink(url);
      }
    }
  });

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
      partition: "persist:zapfood",
      devTools: true,
      webSecurity: true,
    },
    frame: false,
    titleBarStyle: "hidden",
  });

  const ses = win.webContents.session;

  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.startsWith("http://localhost:8080")) {
      if (!details.requestHeaders["Origin"]) {
        details.requestHeaders["Origin"] = "http://localhost:8080";
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  ses.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(true);
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

function handleDeepLink(url: string) {
  if (!win) return;

  if (win.isMinimized()) win.restore();
  win.focus();

  win.webContents.send("deep-link", url);
}

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
      silent: true,
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

    setTimeout(() => {
      notification.close();
    }, 5000);

    return { success: true };
  }
);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
