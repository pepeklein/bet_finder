/**
 * @file relevance.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Provides functions for loading keyword lists and calculating relevance scores
 *   for news articles based on keyword presence in the title and summary.
 *   Used to filter and rank news items for display in the BetFinder application.
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

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
 * The score is incremented by 2 for each keyword found in the title and by 1 for each keyword found in the summary.
 *
 * @function
 * @param {{titulo: string, resumo: string}} newsItem - The news item to score.
 * @param {Array<string>} keywords - The list of keywords to check.
 * @returns {number} The relevance score for the news item.
 */
function scoreNews(newsItem, keywords) {
  const titulo = (newsItem.titulo || "").toLowerCase();
  const resumo = (newsItem.resumo || "").toLowerCase();
  let score = 0;
  keywords.forEach((kw) => {
    const kwLower = kw.toLowerCase();
    if (titulo.includes(kwLower)) score += 2; // Higher weight for title matches
    if (resumo.includes(kwLower)) score += 1; // Normal weight for summary matches
  });
  return score;
}

module.exports = { loadKeywords, scoreNews };
