const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');
const { images: skincareImages } = require('./skincareCatalog');

const imagePools = {
  // Keep these pools in the same order as the frontend fallback catalog so a
  // product's image stays attached to its corresponding catalog entry.
  sarees: [
    'https://images.unsplash.com/photo-1776504768745-551029df100d?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1638456286433-79766945a656?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1738690940173-e16fee805fe9?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1693382507826-e1ee4140f6a7?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1717835429626-d6dd3f2c9afb?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1597897545901-6ac15b725974?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1763017707725-a9854affe474?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1738690789530-9c5ee199575c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1680711552692-76a8bd810398?auto=format&fit=crop&w=900&q=85'
  ],
  kurtis: [
    'https://images.unsplash.com/photo-1742800786544-e935375035e3?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1754391851702-e5275cf80e34?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1766994063823-ed214f883548?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1754641600710-16c1ba3894c6?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1742800788220-1e42256d6022?auto=format&fit=crop&w=900&q=85',
    36311379,8770996,28512776,13178920,35521738,36567501,28512787
  ],
  skirts: [
    'https://images.unsplash.com/photo-1561932850-f13404855e53?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1783095628724-c6036ce0ce70?auto=format&fit=crop&w=900&q=85',
    764872,22468578,16986581,22819845,5848788,11530922,19510476,5542969,8950053,27208599
  ],
  tops: [
    'https://images.unsplash.com/photo-1735855335518-5a05da0730b4?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1717766293792-e78ea97e9d68?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1724403467796-73725db14284?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1683849117195-83517b362436?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1527723503749-9e61addd1b3e?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1715541448115-3be2097950fa?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1548176450-5196b4c0816b?auto=format&fit=crop&w=900&q=85',
    2059051,12678479,2859381,20736190,20483777
  ],
  'western-wear': [31410216,14801160,21879348,8306375,8386652,'https://images.unsplash.com/photo-1760551600273-bca4b15907d0?auto=format&fit=crop&w=900&q=85',3946692,15595670,15345385,10882067,2884299],
  skincare: skincareImages,
  makeup: [2586073,2536009,2535913,2633986,2535928,2547462,2517447,2587363,2517881,2587370],
  shoes: [27113457,27113458,27113460,27113465,27113462,26965810,27113463,26796158,27113459,26965813],
  jewelry: [
    'https://images.unsplash.com/photo-1632525231035-c054cd5019db?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1662833832755-177c2ceb7869?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1774978239401-7bfaff4207ee?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1720528347553-5a251993ee00?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1623133343364-04d1d1a26fcb?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1778182530965-b7dd00070c17?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1787022087854-177d08846b9e?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1767921777873-81818b812a4d?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1778148046789-8e3a677eebbd?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1617191880362-aac615de3c26?auto=format&fit=crop&w=900&q=85'
  ],
  'minimal-jewelry': [
    'https://images.unsplash.com/photo-1778000001290-0b67eeb2fbc2?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1632525231035-c054cd5019db?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1662833832755-177c2ceb7869?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1767921777873-81818b812a4d?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1770643661899-bf150b61789e?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1562819440-91870f5559d9?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1645748655092-74df6b5e93e0?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1623133343364-04d1d1a26fcb?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?auto=format&fit=crop&w=900&q=85'
  ],
  accessories: ['https://images.unsplash.com/photo-1771695838794-d3139108b1cd?auto=format&fit=crop&w=900&q=85',2761038,9558700,1697214,1667088,3641056,8651787,12569725,11506572,15035198,2883138,16353877],
  handbags: [16353877,'https://images.unsplash.com/photo-1713425886033-91a7d74b26a5?auto=format&fit=crop&w=900&q=85',3808249,'https://images.unsplash.com/photo-1559127452-cb4ef7888fa1?auto=format&fit=crop&w=900&q=85',1152077,4830930,26918698,30056477,932401,6787035,28775829]
};

const defaultCategoriesToRefresh = [
  'sarees', 'kurtis', 'skirts', 'tops', 'western-wear',
  'jewelry', 'minimal-jewelry', 'accessories', 'handbags'
];
// Set IMAGE_CATEGORIES to a comma-separated subset when refreshing a focused
// catalog update, so unrelated live products are left untouched.
const categoriesToRefresh = new Set(
  (process.env.IMAGE_CATEGORIES || defaultCategoriesToRefresh.join(','))
    .split(',').map(category => category.trim()).filter(Boolean)
);

function imageUrl(value, width) {
  return typeof value === 'string'
    ? value.replace(/w=\d+/, `w=${width}`)
    : `https://images.pexels.com/photos/${value}/pexels-photo-${value}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

async function checkImage(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { Range: 'bytes=0-0' }, signal: AbortSignal.timeout(12000) });
      const status = response.status;
      if (response.body) await response.body.cancel().catch(() => {});
      if (response.ok || status === 206) return { url, status, ok: true };
      if (status < 500 && status !== 429) return { url, status, ok: false };
    } catch (error) {
      if (attempt === 2) return { url, status: error.name || 'network error', ok: false };
    }
    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
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

async function refreshProductImages() {
  try {
    await connectDB();
    const categories = await Category.find({}, 'slug name img').lean();
    const operations = [];
    const categoryOperations = [];
    const affectedCounts = {};

    for (const category of categories) {
      if (!categoriesToRefresh.has(category.slug)) continue;
      const products = await Product.find({ categorySlug: category.slug }).sort({ createdAt: 1, _id: 1 }).lean();
      if (!products.length) continue;
      const pool = imagePools[category.slug];
      if (!pool || products.length > pool.length) {
        throw new Error(`No complete unique image set for ${category.slug}; no image updates were written.`);
      }

      const mainImages = products.map((_, index) => imageUrl(pool[index % pool.length], 500));
      if (new Set(mainImages).size !== products.length) {
        throw new Error(`Duplicate main image assignment found for ${category.slug}; no image updates were written.`);
      }

      products.forEach((product, index) => {
        const imageIndex = index % pool.length;
        // Keep the product detail gallery tied to this exact product; showing
        // neighboring catalog items as alternate angles makes the image misleading.
        const gallery = [imageUrl(pool[imageIndex], 700)];
        operations.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { img: imageUrl(pool[imageIndex], 500), images: gallery } }
          }
        });
      });
      categoryOperations.push({
        updateOne: {
          filter: { _id: category._id },
          update: { $set: { img: imageUrl(pool[0], 500) } }
        }
      });
      affectedCounts[category.slug] = products.length;
    }

    if (operations.length) await Product.bulkWrite(operations, { ordered: true });
    if (categoryOperations.length) await Category.bulkWrite(categoryOperations, { ordered: true });

    const [products, refreshedCategories] = await Promise.all([
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
    for (const category of refreshedCategories) if (category.img) urls.add(category.img);

    const html = fs.readFileSync(path.join(__dirname, '../../frontend/nariglow.html'), 'utf8');
    for (const match of html.matchAll(/https?:\/\/[^\s"'`<>]+/g)) {
      const url = match[0].replace(/[),;]+$/, '');
      if (!url.includes('${') && (url.includes('images.pexels.com/') || url.includes('images.unsplash.com/'))) urls.add(url);
    }

    const results = await runPool([...urls], 5, checkImage);
    const broken = results.filter(result => !result.ok);
    console.log(`Updated ${operations.length} products across ${Object.keys(affectedCounts).length} categories: ${JSON.stringify(affectedCounts)}`);
    console.log(`Verified ${results.length} unique product, category, and frontend image URLs.`);
    if (broken.length) {
      console.error(`Unhealthy images after refresh: ${broken.length}`);
      for (const result of broken) {
        console.error(`${result.status} ${result.url}`);
        for (const owner of owners.get(result.url) || []) console.error(`  ${owner}`);
      }
      process.exitCode = 2;
    } else {
      console.log('All checked image URLs returned a successful response; main product images are unique within each category.');
    }
    await require('mongoose').disconnect();
  } catch (error) {
    console.error(`Product image refresh failed: ${error.message}`);
    await require('mongoose').disconnect().catch(() => {});
    process.exitCode = 1;
  }
}

refreshProductImages();
