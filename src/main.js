/**
 * @file main.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Main process entry point for the BetFinder Electron application.
 *   Responsible for window creation, loading the renderer, and handling
 *   IPC requests for fetching and scoring news from multiple sources.
 *
 *   This module initializes the Electron app, creates the main window,
 *   and manages inter-process communication (IPC) for retrieving and
 *   processing news articles from various sources. It integrates with
 *   dedicated scraper modules and a relevance scoring system based on
 *   configurable keywords.
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { fetchBnldataNews } = require("./scraper/bnldata");
const { fetchIgamingBrazilNews } = require("./scraper/igamingbrazil");
const { fetchGameBrasNews } = require("./scraper/gamebras");
const { fetchGovFazendaNews } = require("./scraper/govfazenda");
const { loadKeywords, scoreNews } = require("./relevance");

/**
 * Creates the main application window and loads the renderer HTML.
 * Sets window size and icon, and configures preload script.
 *
 * @function
 * @returns {void}
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 800,
    icon: path.join(__dirname, "renderer/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "renderer/index.html"));
}

// Initializes the application when Electron is ready
app.whenReady().then(createWindow);

/**
 * Handles the 'buscar-noticias' IPC event from the renderer process.
 * Fetches news from all configured sites, applies keyword scoring,
 * and returns a structured array of results for each site.
 *
 * @async
 * @function
 * @returns {Promise<Array<{nome: string, total: number, filtradas: Array<{titulo: string, link: string, data: string|null, resumo: string, score: number}>, erro?: string}>>}
 *   Resolves to an array of site result objects, each with:
 *   - nome: Site name
 *   - total: Total news items found
 *   - filtradas: Array of filtered and scored news
 *   - erro: Error message (if any)
 */
ipcMain.handle("buscar-noticias", async () => {
  const keywords = loadKeywords();
  const sites = [
    { nome: "BNLData", fetch: fetchBnldataNews },
    { nome: "iGamingBrazil", fetch: fetchIgamingBrazilNews },
    { nome: "GamesBras", fetch: fetchGameBrasNews },
    { nome: "GovFazenda", fetch: fetchGovFazendaNews },
  ];

  const resultados = [];
  for (const site of sites) {
    try {
      const noticias = await site.fetch();
      const top30 = noticias.slice(0, 30);
      const filtradas = top30
        .map((n) => ({ ...n, score: scoreNews(n, keywords) }))
        .filter((n) => n.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      resultados.push({
        nome: site.nome,
        total: noticias.length,
        filtradas,
      });
    } catch (err) {
      resultados.push({
        nome: site.nome,
        total: 0,
        filtradas: [],
        erro: err.message,
      });
    }
  }
  return resultados;
});

/**
 * Ensures that all external links open in the user's default browser.
 *
 * @event
 * @param {Electron.App} app - The Electron application instance.
 * @param {Electron.WebContents} contents - The web contents instance.
 */
app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });
});
