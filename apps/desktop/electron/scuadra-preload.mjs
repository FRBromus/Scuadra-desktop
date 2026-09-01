import { contextBridge, ipcRenderer } from "electron";

// Bridge exposed to Scuadra web when it runs inside the desktop shell.
// From the web app: `if (window.scuadra?.desktop) { ... }`
contextBridge.exposeInMainWorld("scuadra", {
  desktop: true,
  version: 1,
  pickFolder: () => ipcRenderer.invoke("scuadra:pick-folder"),
  pickFile: () => ipcRenderer.invoke("scuadra:pick-file"),
  listFolder: (folderPath) => ipcRenderer.invoke("scuadra:list-folder", folderPath),
  readFile: (filePath, options) => ipcRenderer.invoke("scuadra:read-file", filePath, options),
  writeFile: (filePath, content, options) => ipcRenderer.invoke("scuadra:write-file", filePath, content, options),
});
