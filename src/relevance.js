const fs = require("fs");
const path = require("path");

/**
 * Loads the list of keywords from the keywords.json file.
 *
 * @function
 * @returns {Array<string>} An array of keywords used for news relevance scoring.
 */
function loadKeywords() {
  const file = path.join(__dirname, "keywords.json");
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

/**
 * Calculates a relevance score for a news item based on the presence of keywords.
 * The score is incremented by 1 for each keyword found in the title or summary.
 *
 * @function
 * @param {{titulo: string, resumo: string}} newsItem - The news item to score.
 * @param {Array<string>} keywords - The list of keywords to check.
 * @returns {number} The relevance score for the news item.
 */
function scoreNews(newsItem, keywords) {
  const text = (newsItem.titulo + " " + newsItem.resumo).toLowerCase();
  let score = 0;
  keywords.forEach((kw) => {
    if (text.includes(kw.toLowerCase())) score++;
  });
  return score;
}

module.exports = { loadKeywords, scoreNews };
