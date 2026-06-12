import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Search a keyword via web scraping (Bing as default search engine).
 * Returns array of { title, url, snippet, source }
 */
export async function searchWeb(keyword) {
  const results = [];
  const encoded = encodeURIComponent(keyword);

  // Use Bing search (no API key needed, be respectful with rate limiting)
  const searchUrl = `https://www.bing.com/search?q=${encoded}&count=20&first=1`;

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Bing search result selectors
    $('li.b_algo').each((i, el) => {
      if (results.length >= 10) return false;
      const titleEl = $(el).find('h2 a');
      const title = titleEl.text().trim();
      const url = titleEl.attr('href') || '';
      const snippet = $(el).find('.b_caption p, .b_lineclamp2').text().trim();

      if (title && url) {
        results.push({
          title,
          url,
          snippet: snippet || title,
          source: 'web',
          sourceName: 'Bing',
          publishedAt: new Date().toISOString(),
        });
      }
    });
  } catch (err) {
    console.error('[Scraper] Search error:', err.message);

    // Fallback: try Google
    try {
      const fallbackResults = await searchGoogle(keyword);
      results.push(...fallbackResults);
    } catch (e) {
      console.error('[Scraper] Google fallback also failed:', e.message);
    }
  }

  return results;
}

async function searchGoogle(keyword) {
  const results = [];
  const encoded = encodeURIComponent(keyword);
  const searchUrl = `https://www.google.com/search?q=${encoded}&num=10&hl=zh-CN`;

  const response = await axios.get(searchUrl, {
    headers: {
      'User-Agent': randomUA(),
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);

  $('div.g, div[data-sokoban-container]').each((i, el) => {
    if (results.length >= 10) return false;
    const titleEl = $(el).find('h3');
    const title = titleEl.text().trim();
    const linkEl = $(el).find('a[href^="http"]');
    const url = linkEl.attr('href') || '';
    const snippet = $(el).find('[data-sncf], .VwiC3b, span.aCOpRe').text().trim();

    if (title && url) {
      results.push({
        title, url,
        snippet: snippet || title,
        source: 'web',
        sourceName: 'Google',
        publishedAt: new Date().toISOString(),
      });
    }
  });

  return results;
}

/**
 * Scrape a specific RSS feed
 */
export async function scrapeRSS(feedUrl) {
  const results = [];
  try {
    const response = await axios.get(feedUrl, {
      headers: { 'User-Agent': randomUA(), 'Accept': 'application/rss+xml, application/xml, text/xml' },
      timeout: 10000,
    });
    const $ = cheerio.load(response.data, { xmlMode: true });

    $('item, entry').each((i, el) => {
      if (results.length >= 10) return false;
      const title = $(el).find('title').first().text().trim();
      const url = $(el).find('link').first().text().trim() || $(el).find('link').attr('href') || '';
      const snippet = $(el).find('description, summary').first().text().trim();
      const pubDate = $(el).find('pubDate, published, updated').first().text();

      if (title && url) {
        results.push({
          title, url,
          snippet: snippet?.replace(/<[^>]*>/g, '').slice(0, 300) || title,
          source: 'rss',
          sourceName: feedUrl,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    });
  } catch (err) {
    console.error('[Scraper] RSS error:', err.message);
  }
  return results;
}
