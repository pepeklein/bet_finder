/**
 * @file bnldata.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Scraper module for extracting news articles from the BNLData website.
 *   Fetches news from both the homepage highlights and the latest news in the editorias section.
 *   Extracts title, link, summary, and date (in dd/mm/yy format) for each news item.
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Extracts news articles from BNLData, prioritizing homepage highlights and then the latest news from the editorias page.
 * Only today's news are included from the homepage. Each news item contains title, link, summary, and date.
 *
 * @async
 * @function fetchBnldataNews
 * @returns {Promise<Array<{titulo: string, link: string, data: string|null, resumo: string}>>}
 *   Resolves to an array of news objects with title, link, date (dd/mm/yy or null), and summary.
 */
async function fetchBnldataNews() {
  const news = [];

  /**
   * Extracts the date from a news card element.
   *
   * @param {CheerioStatic} $ - The cheerio instance.
   * @param {CheerioElement} el - The element to extract the date from.
   * @returns {string|null} The extracted date in dd/mm/yy format, or null if not found.
   */
  function extraiData($, el) {
    const small = $(el).find("small.card__category").text();
    // Looks for pattern "I dd.mm.yy" at the end
    const match = small.match(/I\s*(\d{2})\.(\d{2})\.(\d{2})$/);
    if (match) {
      return `${match[1]}/${match[2]}/${match[3]}`;
    }
    return null;
  }

  // 1. Fetch highlights from homepage
  const homeUrl = "https://bnldata.com.br/";
  const homeRes = await axios.get(homeUrl);
  const $home = cheerio.load(homeRes.data);

  $home(".list-posts .card").each((i, el) => {
    const titulo = $home(el).find(".card__title").text().trim();
    const link = $home(el).find("a").first().attr("href");
    const resumo = $home(el).find("p").text().trim();
    const data = extraiData($home, el);
    if (
      titulo &&
      link &&
      data === dataHoje &&
      !news.some((n) => n.link === link)
    ) {
      news.push({ titulo, link, data, resumo });
    }
  });

  // 2. Fetch latest news from editorias page
  const editoriasUrl = "https://bnldata.com.br/editorias/";
  const editoriasRes = await axios.get(editoriasUrl);
  const $ed = cheerio.load(editoriasRes.data);

  $ed("#cards-area article.card").each((i, el) => {
    const titulo = $ed(el).find(".card__title").text().trim();
    const link = $ed(el).find("a").first().attr("href");
    const resumo = $ed(el).find("p").text().trim();
    const data = extraiData($ed, el);
    if (titulo && link && !news.some((n) => n.link === link)) {
      news.push({ titulo, link, data, resumo });
    }
  });

  return news;
}

/**
 * Today's date in dd/mm/yy format.
 * @constant
 * @type {string}
 */
const hoje = new Date();
const dia = String(hoje.getDate()).padStart(2, "0");
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const ano = String(hoje.getFullYear()).slice(-2);
const dataHoje = `${dia}/${mes}/${ano}`;

module.exports = { fetchBnldataNews };
