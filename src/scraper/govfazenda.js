const axios = require("axios");
const cheerio = require("cheerio");

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

/**
 * Fetches and parses news articles from the Secretaria de Prêmios e Apostas page
 * on the Brazilian Ministry of Finance website.
 * Extracts title, link, date, and summary for each news item.
 *
 * @async
 * @function
 * @returns {Promise<Array<{titulo: string, link: string, data: (string|null), resumo: string}>>}
 *   Resolves to an array of news objects, each containing:
 *   - titulo: The news title.
 *   - link: The absolute URL to the news article.
 *   - data: The publication date (currently always null).
 *   - resumo: The summary of the news.
 */
async function fetchGovFazendaNews() {
  const url =
    "https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas";
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const news = [];

  $(".collection-item").each((i, el) => {
    const titulo = $(el).find("h2 a").text().trim();
    const link = $(el).find("h2 a").attr("href");
    const data = $(el).find("time").attr("datetime") || null;
    const resumo = $(el).find("p.description").text().trim();
    if (titulo && link) {
      news.push({
        titulo,
        link: normalizeUrl("https://www.gov.br", link),
        data: null,
        resumo,
      });
    }
  });
  // Filters valid news and returns up to 10 items
  return news.filter((n) => n.titulo && n.link).slice(0, 10);
}

module.exports = { fetchGovFazendaNews };
