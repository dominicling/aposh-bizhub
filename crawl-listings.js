/**
 * CommercialGuru listing crawler for A'POSH BIZHUB
 * Scrapes for-rent and for-sale listings, updates data.json
 * Run: node crawl-listings.js
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

const RENT_URL = 'https://www.commercialguru.com.sg/property-for-rent?freetext=a+posh+bizhub&property_type=I';
const SALE_URL = 'https://www.commercialguru.com.sg/property-for-sale?freetext=a+posh+bizhub&property_type=I';

async function scrapeListings(page, url, type) {
  console.log(`Scraping ${type}: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Get total count from header like "34 Industrial Properties for Rent"
  const headerText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  const countMatch = headerText.match(/(\d+)\s+Industrial\s+Propert/i);
  const totalCount = countMatch ? parseInt(countMatch[1]) : 0;
  console.log(`  Page says ${totalCount} listings total`);

  // Scroll to load lazy content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 2000));

  // Extract all listing links and their parent card text
  const listings = await page.evaluate((listingType) => {
    const results = [];
    // Find all links to individual listings
    const links = document.querySelectorAll('a[href*="/listing/for-' + listingType + '"]');
    const seen = new Set();

    links.forEach(link => {
      const href = link.href;
      // Deduplicate — same listing may have multiple links (image + title)
      const listingId = href.match(/\d+$/)?.[0];
      if (!listingId || seen.has(listingId)) return;
      seen.add(listingId);

      // Walk up to find the card container — look for a parent that contains price + size info
      let card = link;
      for (let i = 0; i < 10; i++) {
        card = card.parentElement;
        if (!card) break;
        const t = card.innerText || '';
        if (t.includes('sqft') && t.includes('S$')) break;
      }
      if (!card) return;

      const text = card.innerText;
      // Extract: S$ X,XXX /mo (rent) or S$ X,XXX,XXX (sale)
      const priceMatch = listingType === 'rent'
        ? text.match(/S\$\s*([\d,]+)\s*\/mo/i)
        : text.match(/S\$\s*([\d,]+(?:,\d{3})*)\b(?!\s*(?:\/mo|psf))/i);
      const psfMatch = text.match(/S\$\s*([\d.]+)\s*psf/i);
      const sizeMatch = text.match(/([\d,]+)\s*sqft/i);

      if (priceMatch || sizeMatch) {
        results.push({
          price: priceMatch ? 'S$' + priceMatch[1].trim() : null,
          psf: psfMatch ? 'S$' + psfMatch[1].trim() : null,
          size: sizeMatch ? sizeMatch[1].replace(/,/g, '') : null,
          url: href
        });
      }
    });

    return results;
  }, type);

  console.log(`  Extracted ${listings.length} ${type} listings from page`);
  return listings;
}

function formatRentListing(raw) {
  const sizeNum = raw.size ? Number(raw.size) : 0;
  const size = sizeNum > 0 ? `${sizeNum.toLocaleString('en-SG')} sqft` : 'N/A';
  return {
    unit: 'N/A',
    size,
    monthlyRent: raw.price || 'N/A',
    psf: raw.psf || 'N/A',
    notes: '',
    url: raw.url || ''
  };
}

function formatSaleListing(raw) {
  const sizeNum = raw.size ? Number(raw.size) : 0;
  const size = sizeNum > 0 ? `${sizeNum.toLocaleString('en-SG')} sqft` : 'N/A';
  return {
    unit: 'N/A',
    size,
    price: raw.price ? 'S$' + raw.price.replace(/S\$/g, '').trim() : 'N/A',
    psf: raw.psf || 'N/A',
    notes: '',
    url: raw.url || ''
  };
}

function calcMarketInsights(forSale, forRent) {
  const salePsfs = forSale.map(l => parseFloat((l.psf || '').replace(/[^0-9.]/g, ''))).filter(n => n > 0);
  const rentPsfs = forRent.map(l => parseFloat((l.psf || '').replace(/[^0-9.]/g, ''))).filter(n => n > 0);
  const rents = forRent.map(l => parseFloat((l.monthlyRent || '').replace(/[^0-9.]/g, ''))).filter(n => n > 0);
  const salePrices = forSale.map(l => parseFloat((l.price || '').replace(/[^0-9.]/g, ''))).filter(n => n > 0);

  const fmt = n => n.toLocaleString('en-SG');

  return {
    avgSalePsf: salePsfs.length >= 2
      ? `S$${fmt(Math.round(Math.min(...salePsfs)))}–S$${fmt(Math.round(Math.max(...salePsfs)))}`
      : 'N/A',
    avgRentPsf: rentPsfs.length >= 2
      ? `S$${Math.min(...rentPsfs).toFixed(2)}–S$${Math.max(...rentPsfs).toFixed(2)}`
      : 'N/A',
    salePriceRange: salePrices.length >= 2
      ? `S$${fmt(Math.round(Math.min(...salePrices) / 1000))}K–S$${(Math.max(...salePrices) / 1000000).toFixed(2)}M`
      : 'N/A',
    rentRange: rents.length >= 2
      ? `S$${fmt(Math.min(...rents))}–S$${fmt(Math.max(...rents))}/mo`
      : 'N/A',
    unitsForSale: String(forSale.length),
    unitsForRent: String(forRent.length),
    trend: 'Stable demand, 60-yr leasehold B1 industrial',
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

async function main() {
  console.log('Starting CommercialGuru crawler...');
  console.log('Time:', new Date().toISOString());

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const prevRentCount = data.forRent?.length || 0;
  const prevSaleCount = data.forSale?.length || 0;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    const rawRent = await scrapeListings(page, RENT_URL, 'rent');
    const rawSale = await scrapeListings(page, SALE_URL, 'sale');

    if (rawRent.length === 0 && rawSale.length === 0) {
      console.error('ERROR: Got 0 listings for both rent and sale. Keeping existing data.json.');
      process.exit(1);
    }

    const forRent = rawRent.map(formatRentListing);
    const forSale = rawSale.map(formatSaleListing);

    // Sort by price ascending
    forRent.sort((a, b) => (parseFloat((a.monthlyRent || '').replace(/[^0-9.]/g, '')) || 0) - (parseFloat((b.monthlyRent || '').replace(/[^0-9.]/g, '')) || 0));
    forSale.sort((a, b) => (parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0) - (parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0));

    const marketInsights = calcMarketInsights(forSale, forRent);
    if (data.marketInsights?.lastTransactionPsf) {
      marketInsights.lastTransactionPsf = data.marketInsights.lastTransactionPsf;
    }

    data.forSale = forSale;
    data.forRent = forRent;
    data.marketInsights = marketInsights;

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');

    console.log('\nResults:');
    console.log(`  For Rent: ${prevRentCount} → ${forRent.length}`);
    console.log(`  For Sale: ${prevSaleCount} → ${forSale.length}`);
    console.log(`  Avg Rent PSF: ${marketInsights.avgRentPsf}`);
    console.log(`  Avg Sale PSF: ${marketInsights.avgSalePsf}`);
    console.log(`  Rent Range: ${marketInsights.rentRange}`);
    console.log(`  Saved to ${DATA_FILE}`);

    if (forRent.length > 0) console.log('\nSample rent:', JSON.stringify(forRent[0]));
    if (forSale.length > 0) console.log('Sample sale:', JSON.stringify(forSale[0]));
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Crawler failed:', err.message);
  process.exit(1);
});
