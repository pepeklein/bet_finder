/**
 * @file govfazenda.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Scraper module for extracting news articles from the SPA (Secretaria de Prêmios e Apostas)
 *   section of the Brazilian Ministry of Finance (GovFazenda) website. Fetches news from all
 *   paginated news pages, filtering to include only news published on the current day.
 *   Each news item contains title, link, summary, and date (in dd/mm/yyyy format).
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Normalizes a URL, ensuring it is absolute.
 *
 * @function
 * @param {string} base - The base URL to use if the href is relative.
 * @param {string} href - The href to normalize.
 * @returns {string} The absolute URL.
 */
function normalizeUrl(base, href) {
  if (!href) return "";
  return href.startsWith("http") ? href : base + href;
}

/**
 * Fetches all news articles from the SPA (GovFazenda) news page, including all paginated pages.
 * Filters and returns only news published on the current day.
 *
 * @async
 * @function fetchGovFazendaNews
 * @returns {Promise<Array<{titulo: string, link: string, data: string, resumo: string}>>}
 *   Resolves to an array of news objects with title, link, date (dd/mm/yyyy), and summary.
 */
async function fetchGovFazendaNews() {
  const baseUrl = "https://www.gov.br";
  let url =
    "https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/copy_of_noticias";
  const news = [];
  const visited = new Set();

  // Today's date in dd/mm/yyyy format
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano = hoje.getFullYear();
  const dataHoje = `${dia}/${mes}/${ano}`;

  while (url && !visited.has(url)) {
    visited.add(url);
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    $("article.tileItem").each((i, el) => {
      const titulo = $(el).find("h2.tileHeadline a").text().trim();
      const link = $(el).find("h2.tileHeadline a").attr("href");
      const resumo = $(el).find("p.tileBody span.description").text().trim();
      // Extracts the date from the span with summary-view-icon
      let data = null;
      const spanData = $(el).find("span.summary-view-icon").text().trim();
      if (spanData) {
        // Removes icon and gets only the date (e.g., "03/06/2025")
        data = spanData.replace(/^\s*\S+\s*/, "").trim();
      }
      // Adds only if it is from the current day
      if (
        titulo &&
        link &&
        data === dataHoje &&
        !news.some((n) => n.link === link)
      ) {
        news.push({
          titulo,
          link: normalizeUrl("", link),
          data,
          resumo,
        });
      }
    });

    // Finds the link to the next page
    const nextHref = $("ul.paginacao li a.proximo").attr("href");
    if (nextHref && !visited.has(nextHref)) {
      url = normalizeUrl(baseUrl, nextHref);
    } else {
      url = null;
    }
  }

  return news;
}

module.exports = { fetchGovFazendaNews };
