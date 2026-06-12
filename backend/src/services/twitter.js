import axios from 'axios';

const TWITTER_API_BASE = 'https://twitterapi.io/api';

function getApiKey() {
  return process.env.TWITTER_API_KEY;
}

export async function searchTwitter(keyword) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.includes('your-twitterapi')) {
    console.warn('[Twitter] No API key configured, skipping Twitter search');
    return [];
  }

  const results = [];
  const encoded = encodeURIComponent(keyword);

  try {
    const response = await axios.get(TWITTER_API_BASE + '/search', {
      params: { query: encoded, max_results: 15 },
      headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
      timeout: 20000,
    });

    const tweets = response.data?.tweets || response.data?.data || response.data?.results || [];

    for (const tweet of tweets) {
      const text = tweet.text || tweet.full_text || tweet.content || '';
      const author = tweet.author || tweet.user?.screen_name || tweet.username || 'unknown';
      const tweetId = tweet.id || tweet.tweet_id || '';

      if (text) {
        results.push({
          title: text.slice(0, 150) + (text.length > 150 ? '...' : ''),
          url: tweetId ? 'https://twitter.com/' + author + '/status/' + tweetId : 'https://twitter.com/search?q=' + encoded,
          snippet: text,
          source: 'twitter',
          sourceName: '@' + author,
          publishedAt: tweet.created_at ? new Date(tweet.created_at).toISOString() : new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn('[Twitter] Rate limited, will retry later');
    } else {
      console.error('[Twitter] Search error:', err.message);
    }
  }

  return results;
}

export async function getTimelineTweets(usernames = []) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.includes('your-twitterapi')) return [];

  const defaultAccounts = [
    'OpenAI', 'AnthropicAI', 'GoogleAI', 'MetaAI',
    'huggingface', 'LangChainAI', 'vercel',
  ];
  const accounts = usernames.length > 0 ? usernames : defaultAccounts;
  const allResults = [];

  for (const username of accounts.slice(0, 5)) {
    try {
      const response = await axios.get(TWITTER_API_BASE + '/user-tweets', {
        params: { username, max_results: 5 },
        headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' },
        timeout: 15000,
      });

      const tweets = response.data?.tweets || response.data?.data || [];
      for (const tweet of tweets) {
        const text = tweet.text || tweet.full_text || tweet.content || '';
        if (text) {
          allResults.push({
            title: text.slice(0, 150) + (text.length > 150 ? '...' : ''),
            url: 'https://twitter.com/' + username + '/status/' + (tweet.id || tweet.tweet_id || ''),
            snippet: text,
            source: 'twitter',
            sourceName: '@' + username,
            publishedAt: tweet.created_at ? new Date(tweet.created_at).toISOString() : new Date().toISOString(),
          });
        }
      }

      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error('[Twitter] Error fetching @' + username + ':', err.message);
    }
  }

  return allResults;
}