/**
 * Preload script for the BetFinder Electron application.
 * Exposes a secure API to the renderer process for invoking
 * IPC methods related to news fetching.
 *
 * Uses Electron's contextBridge to safely expose only the
 * 'buscarNoticias' function, which triggers the 'buscar-noticias'
 * IPC event and returns the results from the main process.
 */

const { contextBridge, ipcRenderer } = require("electron");

/**
 * Exposes the 'betfinder' API in the renderer process.
 * @namespace betfinder
 * @property {function(): Promise<any>} buscarNoticias - Fetches news from all sources via IPC.
 */
contextBridge.exposeInMainWorld("betfinder", {
  buscarNoticias: () => ipcRenderer.invoke("buscar-noticias"),
});
