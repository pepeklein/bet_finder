const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Checks if a news item with the given link already exists in the news array.
 *
 * @function
 * @param {Array<{link: string}>} news - The array of news objects.
 * @param {string} link - The link to check for existence.
 * @returns {boolean} Returns true if the link does not exist in the news array, false otherwise.
 */
function notExists(news, link) {
  return !news.some((n) => n.link === link);
}

/**
 * Fetches and parses news articles from the GamesBras website.
 * Attempts to retrieve highlighted news first; if none are found,
 * falls back to the main news feed. Extracts title, link, and date for each news item.
 *
 * @async
 * @function
 * @returns {Promise<Array<{titulo: string, link: string, data: (string|null), resumo: string}>>}
 *   Resolves to an array of news objects, each containing:
 *   - titulo: The news title.
 *   - link: The URL to the news article.
 *   - data: The publication date (if available), or null.
 *   - resumo: The summary (empty string by default).
 */
async function fetchGameBrasNews() {
  const url = "https://www.gamesbras.com/";
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const news = [];

  // Attempts to get highlighted news (e.g., slider or featured section)
  $("div#destaques a:has(h2.tituloM)").each((i, el) => {
    const urlCompleto = normalizeUrl(
      "https://www.gamesbras.com",
      $(el).attr("href")
    );
    if (notExists(news, urlCompleto)) {
      // Tries to find the date in the parent or in the link itself
      const parent = $(el).closest("div.noticiaM, div.destaqueM");
      let data = parent.find("span.data").text().trim();
      if (!data) {
        data = $(el).find("span.data").text().trim();
      }
      if (!data) {
        // Tries to get from next sibling element
        data = parent.next("span.data").text().trim();
      }
      if (!data) data = null;
      news.push({
        titulo: $(el).find("h2.tituloM").text().trim(),
        link: urlCompleto,
        data,
        resumo: "",
      });
    }
  });

  // If nothing found, gets all from the main feed
  if (news.length === 0) {
    $("a:has(h2.tituloM)").each((i, el) => {
      const urlCompleto = normalizeUrl(
        "https://www.gamesbras.com",
        $(el).attr("href")
      );
      if (notExists(news, urlCompleto)) {
        // Tries to find the date in the parent element
        const parent = $(el).closest("div.noticiaM, div.destaqueM");
        const data = parent.find("span.data").text().trim() || null;
        news.push({
          titulo: $(el).find("h2.tituloM").text().trim(),
          link: urlCompleto,
          data: null,
          resumo: "",
        });
      }
    });
  }
  // Filters valid news and returns up to 10 items
  return news.filter((n) => n.titulo && n.link).slice(0, 10);
}

/**
 * Normalizes a URL, ensuring it is absolute.
 * If the href is relative, prepends the base URL.
 *
 * @function
 * @param {string} base - The base URL.
 * @param {string} href - The href to normalize.
 * @returns {string} The normalized absolute URL, or an empty string if href is falsy.
 */
function normalizeUrl(base, href) {
  if (!href) return "";
  return href.startsWith("http") ? href : base + href;
}

module.exports = { fetchGameBrasNews };
