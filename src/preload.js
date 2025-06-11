/**
 * @file preload.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Preload script for the BetFinder Electron application.
 *   Exposes a secure API to the renderer process for invoking
 *   IPC methods related to news fetching.
 *
 *   Uses Electron's contextBridge to safely expose only the
 *   'buscarNoticias' function, which triggers the 'buscar-noticias'
 *   IPC event and returns the results from the main process.
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

const { contextBridge, ipcRenderer } = require("electron");

/**
 * Exposes the 'betfinder' API in the renderer process.
 * Provides a secure method for fetching news from all sources via IPC.
 *
 * @namespace betfinder
 * @property {function(): Promise<any>} buscarNoticias - Fetches news from all sources via IPC.
 */
contextBridge.exposeInMainWorld("betfinder", {
  /**
   * Fetches news from all configured sources by invoking the 'buscar-noticias' IPC event.
   *
   * @function
   * @memberof betfinder
   * @returns {Promise<any>} Resolves to the array of news results from the main process.
   */
  buscarNoticias: () => ipcRenderer.invoke("buscar-noticias"),
});
