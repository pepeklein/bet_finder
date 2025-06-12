/**
 * @file gamebras.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Scraper module for extracting news articles from the GamesBras website.
 *   Fetches news from the homepage, then visits each news link to extract the publication date and summary.
 *   Only news published on the current day are included. Each news item contains title, link, summary, and date (in dd/mm/yy format).
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetches all news articles from the GamesBras homepage.
 * For each news item, visits the link and includes it only if the publication date matches the current day.
 * Extracts the date from <h6 class="fecha_interna"> in dd/mm/yy format and the summary from the article content.
 *
 * @async
 * @function fetchGameBrasNews
 * @returns {Promise<Array<{titulo: string, link: string, data: string|null, resumo: string}>>}
 *   Resolves to an array of news objects with title, link, date (dd/mm/yy or null), and summary.
 */
async function fetchGameBrasNews() {
  const homeUrl = "https://www.gamesbras.com/";
  const news = [];

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

  /**
   * Checks if the given date string matches today's date.
   *
   * @function
   * @param {string|null} dataStr - The date string to check.
   * @returns {boolean} True if the date matches today, false otherwise.
   */
  function isHoje(dataStr) {
    return dataStr === dataHoje;
  }

  try {
    const homeRes = await axios.get(homeUrl);
    const $home = cheerio.load(homeRes.data);

    // Finds all <h2 class="tituloM"> and ascends to the nearest ancestor <a>
    const links = [];
    $home("h2.tituloM").each((i, el) => {
      const h2 = $home(el);
      // Ascend to the nearest ancestor <a>
      const a = h2.parents("a").first();
      let link = a.attr("href");
      const titulo = h2.text().trim();
      if (link && !link.startsWith("http")) {
        link = "https://www.gamesbras.com" + link;
      }
      if (titulo && link && !links.some((l) => l.link === link)) {
        links.push({ titulo, link });
      }
    });

    // For each news item, visit and validate the date
    for (const { titulo, link } of links) {
      try {
        const noticiaRes = await axios.get(link);
        const $noticia = cheerio.load(noticiaRes.data);

        // Extracts the publication date from <h6 class="fecha_interna">
        let data = null;
        const fecha = $noticia('h6.fecha_interna[itemprop="datePublished"]');
        if (fecha.length) {
          const content = fecha.attr("content");
          if (content && /^\d{4}-\d{2}-\d{2}$/.test(content)) {
            const [ano, mes, dia] = content.split("-");
            data = `${dia}/${mes}/${ano.slice(-2)}`;
          }
        }

        // Extracts the summary: prioritizes <h3 itemprop="description">, otherwise uses <div.nota p>
        let resumo = $noticia('h3[itemprop="description"]').text().trim();
        if (!resumo) {
          resumo = $noticia("div.nota p").text().trim();
        }

        if (isHoje(data)) {
          news.push({ titulo, link, data, resumo });
        }
      } catch (e) {
        // If an error occurs, skip this news item
      }
    }
  } catch (e) {
    // If an error occurs, skip and continue
  }

  return news;
}

module.exports = { fetchGameBrasNews };
