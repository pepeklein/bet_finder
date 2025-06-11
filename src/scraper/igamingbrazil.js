/**
 * @file igamingbrazil.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Scraper module for extracting news articles from the "Todas as Notícias" page
 *   of the iGamingBrazil website. Fetches news for the current day only, extracting
 *   the title, link, and date (if available) for each news item.
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetches news articles from the "Todas as Notícias" page of iGamingBrazil.
 * Extracts the title, link, and date (if available) for each news item published on the current day.
 *
 * @async
 * @function fetchIgamingBrazilNews
 * @returns {Promise<Array<{titulo: string, link: string, data: string|null, resumo: string}>>}
 *   Resolves to an array of news objects with title, link, date (ISO format or null), and summary (empty string).
 */
async function fetchIgamingBrazilNews() {
  const url = "https://igamingbrazil.com/todas-as-noticias/";
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const news = [];

  // Today's date in yyyy-mm-dd format
  const hoje = new Date();
  const dataHoje = hoje.toISOString().slice(0, 10);

  $("div.td-module-container.td-category-pos-image").each((i, el) => {
    const a = $(el).find("h3.entry-title a");
    const time = $(el).find("time.entry-date");
    const data = time.attr("datetime")
      ? time.attr("datetime").slice(0, 10)
      : null;
    if (a.text().trim() && a.attr("href") && data === dataHoje) {
      news.push({
        titulo: a.text().trim(),
        link: a.attr("href"),
        data: time.attr("datetime") || null,
        resumo: "",
      });
    }
  });

  return news;
}

module.exports = { fetchIgamingBrazilNews };
