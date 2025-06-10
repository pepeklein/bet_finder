/**
 * Main process entry point for the BetFinder Electron application.
 * Responsible for window creation, loading the renderer, and handling
 * IPC requests for fetching and scoring news from multiple sources.
 *
 * Dependencies:
 * - Electron (app, BrowserWindow, ipcMain)
 * - Node.js path module
 * - News scrapers for each site
 * - Relevance module for keyword loading and scoring
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
        .filter((n) => n.score > 0);
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
