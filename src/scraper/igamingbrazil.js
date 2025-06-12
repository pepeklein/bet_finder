/**
 * @file igamingbrazil.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Scraper module for extracting news articles from the "Todas as Notícias" page
 *   of the iGamingBrazil website. Fetches news for the current day only, extracting
 *   the title, link, date (if available), and summary for each news item.
 *
 *   This module loads the news list, visits each news page to extract the publication date,
 *   and includes only articles published on the current day. The summary is extracted from
 *   the first paragraph of the article content.
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
 * Extracts the title, link, date (if available), and summary for each news item published on the current day.
 *
 * @async
 * @function fetchIgamingBrazilNews
 * @returns {Promise<Array<{titulo: string, link: string, data: string|null, resumo: string}>>}
 *   Resolves to an array of news objects with title, link, date (ISO format or null), and summary.
 */
async function fetchIgamingBrazilNews() {
  const url = "https://igamingbrazil.com/todas-as-noticias/";
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const news = [];

  // Today's date in yyyy-mm-dd format
  const hoje = new Date();
  const dataHoje = hoje.toISOString().slice(0, 10);

  // Collects all news links from the listing
  const links = [];
  $(".td_module_wrap h3.entry-title a").each((i, el) => {
    const titulo = $(el).text().trim();
    const link = $(el).attr("href");
    if (titulo && link) {
      links.push({ titulo, link });
    }
  });

  // For each news item, visit the page and extract the date and summary
  for (const { titulo, link } of links) {
    try {
      const resNoticia = await axios.get(link);
      const $noticia = cheerio.load(resNoticia.data);
      // Attempts to extract the date from various selectors
      const time = $noticia(
        "time.entry-date, time.updated, .td-post-date time"
      ).first();
      let data = null;
      if (time.length) {
        data = time.attr("datetime")
          ? time.attr("datetime").slice(0, 10)
          : null;
      } else {
        // Fallback: tries to extract date from text
        const dataTxt = $noticia(".td-post-date").text().trim();
        const match = dataTxt.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) data = match[0];
      }
      // Only adds if the news is from today
      if (data === dataHoje) {
        // Attempts to extract a summary (first paragraph of the content)
        let resumo = $noticia(".td-post-content p").first().text().trim();
        news.push({ titulo, link, data, resumo });
      }
    } catch (e) {
      // If an error occurs, skip this news item
    }
  }

  return news;
}

module.exports = { fetchIgamingBrazilNews };
