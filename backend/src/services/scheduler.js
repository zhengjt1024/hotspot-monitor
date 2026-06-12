import cron from 'node-cron';
import db from '../db.js';
import { searchWeb, scrapeRSS } from './scraper.js';
import { searchTwitter, getTimelineTweets } from './twitter.js';
import { analyzeContent, contentHash } from './ai.js';

/**
 * Main monitoring cycle:
 * 1. Fetch all enabled keywords
 * 2. For each, search web + twitter
 * 3. AI analysis: relevance + fake detection
 * 4. Dedup via content hash
 * 5. Store results + create notifications
 */
export async function runMonitorCycle() {
  console.log('[Monitor] Starting monitoring cycle...');
  const startTime = Date.now();
  let newTopics = 0;
  let newNotifications = 0;

  const keywords = db.prepare('SELECT * FROM keywords WHERE enabled = 1').all();

  if (keywords.length === 0) {
    console.log('[Monitor] No keywords configured, skipping');
    return { newTopics: 0, newNotifications: 0 };
  }

  for (const kw of keywords) {
    const sources = kw.source_types?.split(',').map(s => s.trim()) || ['web', 'twitter'];
    let allResults = [];

    // Collect from multiple sources
    const fetchPromises = [];
    if (sources.includes('web')) {
      fetchPromises.push(
        searchWeb(kw.keyword).then(r => { allResults.push(...r); })
      );
    }
    if (sources.includes('twitter')) {
      fetchPromises.push(
        searchTwitter(kw.keyword).then(r => { allResults.push(...r); })
      );
    }
    if (sources.includes('rss')) {
      // Default AI news RSS feeds
      const rssFeeds = [
        'https://hnrss.org/frontpage?q=AI+OR+LLM+OR+GPT',
        'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
      ];
      for (const feed of rssFeeds) {
        fetchPromises.push(
          scrapeRSS(feed).then(r => { allResults.push(...r); })
        );
      }
    }

    await Promise.allSettled(fetchPromises);

    // Also fetch from key AI Twitter accounts (only on first keyword to avoid duplicates)
    if (sources.includes('twitter') && keywords.indexOf(kw) === 0) {
      try {
        const timelineResults = await getTimelineTweets();
        allResults.push(...timelineResults);
      } catch (e) { /* ignore */ }
    }

    console.log(`[Monitor] Keyword "${kw.keyword}": ${allResults.length} raw results from sources`);

    // Process each result
    for (const item of allResults.slice(0, 20)) {
      const hash = contentHash(item.title, item.url);

      // Skip duplicates
      const existing = db.prepare('SELECT id FROM topics WHERE content_hash = ?').get(hash);
      if (existing) continue;

      // AI analysis
      let analysis = { relevanceScore: 50, isFake: false, summary: '', reason: '' };
      try {
        analysis = await analyzeContent(kw.keyword, {
          title: item.title,
          snippet: item.snippet,
          source: item.source,
        });
        // Rate limiting between AI calls
        await new Promise(r => setTimeout(r, 1500));
      } catch (e) {
        console.error(`[Monitor] AI analysis failed for "${item.title}":`, e.message);
      }

      // Only store if relevant enough
      if (analysis.relevanceScore < 30) continue;

      // Insert topic
      const stmt = db.prepare(`
        INSERT INTO topics (keyword_id, title, url, source, source_name, summary, relevance_score, is_verified, is_fake, content_hash, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        kw.id,
        item.title.slice(0, 500),
        item.url || '',
        item.source,
        item.sourceName || '',
        analysis.summary?.slice(0, 500) || '',
        analysis.relevanceScore,
        analysis.relevanceScore >= 50 ? 1 : 0,
        analysis.isFake ? 1 : 0,
        hash,
        item.publishedAt || new Date().toISOString(),
      );
      newTopics++;

      // Create notification for high-relevance, verified content
      if (analysis.relevanceScore >= 60 && !analysis.isFake) {
        db.prepare(`
          INSERT INTO notifications (topic_id, keyword, message, type)
          VALUES (?, ?, ?, ?)
        `).run(
          db.prepare('SELECT last_insert_rowid()').get()['last_insert_rowid()'],
          kw.keyword,
          `🔥 [${kw.keyword}] ${analysis.summary || item.title.slice(0, 100)}`,
          'hot_topic',
        );
        newNotifications++;
      } else if (analysis.isFake) {
        db.prepare(`
          INSERT INTO notifications (topic_id, keyword, message, type)
          VALUES (?, ?, ?, ?)
        `).run(
          db.prepare('SELECT last_insert_rowid()').get()['last_insert_rowid()'],
          kw.keyword,
          `⚠️ 疑似虚假内容: ${item.title.slice(0, 80)}`,
          'fake_alert',
        );
        newNotifications++;
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Monitor] Cycle complete: ${newTopics} new topics, ${newNotifications} notifications (${elapsed}s)`);

  return { newTopics, newNotifications };
}

let cronJob = null;

/**
 * Start scheduler with configurable interval (in minutes)
 */
export function startScheduler(intervalMinutes = 30) {
  if (cronJob) cronJob.stop();

  // Run immediately on start
  setTimeout(() => {
    runMonitorCycle().catch(err => console.error('[Scheduler] Initial run failed:', err));
  }, 5000);

  // Schedule periodic runs
  const cronExpr = `*/${intervalMinutes} * * * *`;
  cronJob = cron.schedule(cronExpr, () => {
    runMonitorCycle().catch(err => console.error('[Scheduler] Cycle failed:', err));
  });

  console.log(`[Scheduler] Scheduled every ${intervalMinutes} minutes`);
}

export function stopScheduler() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}
