const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetches and parses news articles from the BNLData website.
 * Attempts to retrieve the "most read" news first; if none are found,
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
async function fetchBnldataNews() {
  const url = "https://bnldata.com.br/";
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const news = [];

  // Attempts to get "most read" news (adjust selector as needed)
  $("div.widget.widget-most-read ul li a").each((i, el) => {
    // Tries to find the date in the parent or nearby element
    const parent = $(el).closest("li");
    let data = parent.find(".date, .card__date").text().trim();
    if (!data) {
      // Tries to get from next sibling element
      data = parent.next(".date, .card__date").text().trim();
    }
    if (!data) data = null;
    news.push({
      titulo: $(el).text().trim(),
      link: $(el).attr("href"),
      data,
      resumo: "",
    });
  });

  // If nothing found, gets all from the main feed
  if (news.length === 0) {
    $("h4.card__title a").each((i, el) => {
      const parent = $(el).closest(".card");
      let data = parent.find(".card__date, .date").text().trim();
      if (!data) {
        data = parent.next(".card__date, .date").text().trim();
      }
      if (!data) data = null;
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

module.exports = { fetchBnldataNews };
