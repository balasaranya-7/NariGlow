const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');

async function checkImage(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Range: 'bytes=0-0' },
        signal: AbortSignal.timeout(12000)
      });
      const status = response.status;
      if (response.body) await response.body.cancel().catch(() => {});
      if (response.ok || status === 206) return { url, status, ok: true };
      if (status < 500 && status !== 429) return { url, status, ok: false };
    } catch (error) {
      if (attempt === 2) return { url, status: error.name || 'network error', ok: false };
    }
    await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
  }
  return { url, status: 'retry limit', ok: false };
}

async function runPool(values, workerCount, worker) {
  const results = new Array(values.length);
  let next = 0;
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (next < values.length) {
      const index = next++;
      results[index] = await worker(values[index]);
    }
  }));
  return results;
}

async function auditProductImages() {
  try {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.find({}, 'name categorySlug img images').lean(),
      Category.find({}, 'name slug img').lean()
    ]);

    const urls = new Set();
    const owners = new Map();
    for (const product of products) {
      for (const url of [product.img, ...(product.images || [])]) {
        if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) continue;
        urls.add(url);
        if (!owners.has(url)) owners.set(url, []);
        owners.get(url).push(`${product.categorySlug}: ${product.name}`);
      }
    }
    for (const category of categories) if (category.img) urls.add(category.img);

    const html = fs.readFileSync(path.join(__dirname, '../../frontend/nariglow.html'), 'utf8');
    for (const match of html.matchAll(/\bsrc=["'](https?:\/\/[^"']+)["']/g)) urls.add(match[1]);

    const uniqueUrls = [...urls];
    const results = await runPool(uniqueUrls, 5, checkImage);
    const broken = results.filter(result => !result.ok);
    console.log(`Checked ${results.length} unique image URLs used by ${products.length} products and ${categories.length} categories.`);
    if (!broken.length) {
      console.log('All checked image URLs returned a successful response.');
    } else {
      console.log(`Unhealthy image URLs: ${broken.length}`);
      for (const result of broken) {
        console.log(`${result.status} ${result.url}`);
        for (const owner of owners.get(result.url) || []) console.log(`  ${owner}`);
      }
      process.exitCode = 2;
    }
    await require('mongoose').disconnect();
  } catch (error) {
    console.error(`Image audit failed: ${error.message}`);
    await require('mongoose').disconnect().catch(() => {});
    process.exitCode = 1;
  }
}

auditProductImages();
