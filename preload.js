const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("animate", {
/*  contextEnter: (callback) => ipcRenderer.on(
    "LiteLoader.animate.contextEnter",
    callback
  ),
  contextLeave: (callback) => ipcRenderer.on(
    "LiteLoader.animate.contextLeave",
    callback
  ),
  windowActive: (callback) => ipcRenderer.on(
    "LiteLoader.animate.windowActive",
    callback
  ),
  windowInactive: (callback) => ipcRenderer.on(
    "LiteLoader.animate.windowInactive",
    callback
  ),*/
  updateStyle: (callback) => ipcRenderer.on(
    "LiteLoader.animate.updateStyle",
    callback
  ),
  rendererReady: () => ipcRenderer.send(
    "LiteLoader.animate.rendererReady"
  ),
  getSettings: () => ipcRenderer.invoke(
    "LiteLoader.animate.getSettings"
  ),
  setSettings: content => ipcRenderer.invoke(
    "LiteLoader.animate.setSettings",
    content
  ),
  // logToMain: (...args) => ipcRenderer.invoke(
  //   "LiteLoader.animate.logToMain",
  //   ...args
  // ),
});
