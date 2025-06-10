const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetches and parses news articles from the iGaming Brazil website.
 * Attempts to retrieve highlighted news first; if none are found,
 * falls back to the main news feed. Extracts title, link, and date for each news item.
 *
 * @async
 * @function
 * @returns {Promise<Array<{titulo: string, link: string, data: (string|null), resumo: string}>>}
 *   Resolves to an array of news objects, each containing:
 *   - titulo: The news title.
 *   - link: The URL to the news article.
 *   - data: The publication date (currently always null).
 *   - resumo: The summary (empty string by default).
 */
async function fetchIgamingBrazilNews() {
  const url = "https://igamingbrazil.com/";
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const news = [];

  // Attempts to get highlighted news (e.g., slider or featured section)
  $(
    "div.td_block_wrap.tdb_homepage_loop_widget ul.td-block-row li.td-block-span6 h3.entry-title a"
  ).each((i, el) => {
    news.push({
      titulo: $(el).text().trim(),
      link: $(el).attr("href"),
      data: null,
      resumo: "",
    });
  });

  // If nothing found, gets all from the main feed
  if (news.length === 0) {
    $("h3.entry-title a").each((i, el) => {
      const parent = $(el).closest(
        "div.td-module-meta-info, div.td-module-container"
      );
      const data =
        parent.find("time, .td-post-date").first().text().trim() || null;
      news.push({
        titulo: $(el).text().trim(),
        link: $(el).attr("href"),
        data: null,
        resumo: "",
      });
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

module.exports = { fetchIgamingBrazilNews };
