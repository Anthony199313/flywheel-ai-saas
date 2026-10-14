import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'node:dns';

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^::1$/
];

function isPrivateIp(ip) {
  return PRIVATE_IP_RANGES.some((rx) => rx.test(ip));
}

export async function isAllowedUrl(rawUrl) {
  try {
    if (!rawUrl) return false;
    const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const url = new URL(normalized);

    // Block non-http(s) schemes
    if (!['http:', 'https:'].includes(url.protocol)) return false;

    // Basic hostname checks
    const hostname = url.hostname;
    if (/localhost|127\.0\.0\.1/.test(hostname)) return false;

    // DNS lookup and IP range check
    try {
      const addresses = await dns.resolve(hostname);
      for (const ip of addresses) {
        if (isPrivateIp(ip)) return false;
      }
    } catch (err) {
      // If DNS fails, conservatively allow (could be a domain behind CDN); you can change to deny if you prefer
      console.warn('DNS lookup failed for', hostname, err.message);
    }

    return true;
  } catch (err) {
    return false;
  }
}

export async function fetchLivePageData(targetUrl) {
  try {
    const allowed = await isAllowedUrl(targetUrl);
    if (!allowed) return { success: false, error: 'URL blocked by policy' };

    const formattedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const response = await axios.get(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const title = $('title').text().trim() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get();
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get();
    const links = $('a[href]').map((_, el) => $(el).attr('href')).get();

    $('script, style, noscript, svg, nav, footer').remove();
    const cleanText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    return {
      success: true,
      url: formattedUrl,
      title,
      metaDescription,
      h1s,
      h2s,
      wordCount,
      internalLinksCount: links.filter(l => !l.startsWith('http') || l.includes(new URL(formattedUrl).hostname)).length,
      sampleText: cleanText
    };
  } catch (error) {
    // Fallback: Jina Reader
    try {
      const encoded = encodeURIComponent(targetUrl);
      const jinaResponse = await axios.get(`https://r.jina.ai/http://r.jina.ai/${encoded}`, { timeout: 10000 });
      return {
        success: true,
        url: targetUrl,
        title: 'Fetched via Reader Engine',
        metaDescription: 'Live content scraped successfully via Jina Reader',
        h1s: [],
        h2s: [],
        wordCount: jinaResponse.data.split(/\s+/).length,
        internalLinksCount: 0,
        sampleText: jinaResponse.data.slice(0, 4000)
      };
    } catch (jinaErr) {
      return {
        success: false,
        url: targetUrl,
        error: 'Unable to reach website directly.'
      };
    }
  }
}
