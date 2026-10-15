const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');
const { images, newProducts } = require('./skincareCatalog');

const galleryFor = index => [0, 1, 2].map(offset => images[(index + offset) % images.length]);

async function refreshSkincareCatalog() {
  try {
    await connectDB();

    const category = await Category.findOne({ slug: 'skincare' });
    if (!category) throw new Error('Skincare category does not exist. No changes were made.');

    const existing = await Product.find({ categorySlug: 'skincare' }).sort({ createdAt: 1, _id: 1 });
    if (!existing.length) throw new Error('No skincare products found. No changes were made.');

    for (let index = 0; index < existing.length; index++) {
      existing[index].img = images[index % images.length];
      existing[index].images = galleryFor(index);
      await existing[index].save();
    }

    const existingNames = new Set(existing.map(product => product.name.toLowerCase()));
    const additions = newProducts.filter(product => !existingNames.has(product.name.toLowerCase()));
    const startIndex = existing.length;

    if (startIndex + additions.length > images.length) {
      throw new Error('Not enough unique skincare photos for the current catalog. No new products were added.');
    }

    await Product.insertMany(additions.map((product, offset) => {
      const imageIndex = startIndex + offset;
      return {
        ...product,
        brand: 'NariGlow Edit',
        category: 'Skincare',
        categorySlug: 'skincare',
        discountPct: 0,
        rating: 4.6,
        reviews: 28 + offset * 9,
        img: images[imageIndex],
        images: galleryFor(imageIndex),
        stock: 'in',
        material: 'Daily skincare formula',
        care: 'Store in a cool, dry place',
        specifications: { Type: 'Skincare', Origin: 'India' }
      };
    }));

    await Category.updateOne({ _id: category._id }, { $set: { img: images[2] } });
    console.log(`Skincare catalog refreshed: ${existing.length} existing products updated, ${additions.length} new products added.`);
    await require('mongoose').disconnect();
  } catch (error) {
    console.error(`Skincare catalog update failed: ${error.message}`);
    await require('mongoose').disconnect().catch(() => {});
    process.exitCode = 1;
  }
}

refreshSkincareCatalog();
