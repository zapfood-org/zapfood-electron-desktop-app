import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electron", {
  window: {
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.invoke("window-maximize"),
    close: () => ipcRenderer.send("window-close"),
    isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.send("shell-open-external", url),
  },
  ipcRenderer: {
    on(...args: Parameters<typeof ipcRenderer.on>) {
      const [channel, listener] = args;
      return ipcRenderer.on(channel, (event, ...args) =>
        listener(event, ...args)
      );
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
      const [channel, ...omit] = args;
      return ipcRenderer.off(channel, ...omit);
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
      const [channel, ...omit] = args;
      return ipcRenderer.send(channel, ...omit);
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args;
      return ipcRenderer.invoke(channel, ...omit);
    },
  },
  onDeepLink: (callback: (url: string) => void) => {
    const listener = (_event: any, url: string) => callback(url);
    ipcRenderer.on("deep-link", listener);
    // Retornar função de cleanup
    return () => ipcRenderer.off("deep-link", listener);
  },
  onAuthSuccess: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("auth-success", listener);
    return () => ipcRenderer.off("auth-success", listener);
  },
  onAuthError: (callback: (url: string) => void) => {
    const listener = (_event: any, url: string) => callback(url);
    ipcRenderer.on("auth-error", listener);
    return () => ipcRenderer.off("auth-error", listener);
  },
  notifications: {
    show: (
      title: string,
      body: string,
      options?: { icon?: string; tag?: string }
    ) => {
      return ipcRenderer.invoke("notification-show", {
        title,
        body,
        ...options,
      });
    },
  },
});
