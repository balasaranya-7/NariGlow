const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load the same private Atlas/local settings used by the backend server.
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');
const { images: skincareImages, newProducts: newSkincareProducts } = require('./skincareCatalog');

const categoriesData = [
  { slug: "sarees", name: "Sarees", img: "https://images.unsplash.com/photo-1776504768745-551029df100d?auto=format&fit=crop&w=500&q=85" },
  { slug: "kurtis", name: "Kurtis", img: "https://images.unsplash.com/photo-1742800786544-e935375035e3?auto=format&fit=crop&w=500&q=85" },
  { slug: "skirts", name: "Skirts", img: "https://images.unsplash.com/photo-1561932850-f13404855e53?auto=format&fit=crop&w=500&q=85" },
  { slug: "tops", name: "Tops", img: "https://images.unsplash.com/photo-1735855335518-5a05da0730b4?auto=format&fit=crop&w=500&q=85" },
  { slug: "western-wear", name: "Western Wear", img: "https://images.unsplash.com/photo-1760551600273-bca4b15907d0?auto=format&fit=crop&w=500&q=85" },
  { slug: "skincare", name: "Skincare", img: skincareImages[2] },
  { slug: "makeup", name: "Makeup", img: "https://images.pexels.com/photos/2586073/pexels-photo-2586073.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "shoes", name: "Shoes", img: "https://images.pexels.com/photos/27113457/pexels-photo-27113457.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "jewelry", name: "Jewelry", img: "https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?auto=format&fit=crop&w=500&q=85" },
  { slug: "minimal-jewelry", name: "Minimal Jewelry", img: "https://images.unsplash.com/photo-1778000001290-0b67eeb2fbc2?auto=format&fit=crop&w=500&q=85" },
  { slug: "accessories", name: "Accessories", img: "https://images.unsplash.com/photo-1771695838794-d3139108b1cd?auto=format&fit=crop&w=500&q=85" },
  { slug: "handbags", name: "Handbags", img: "https://images.unsplash.com/photo-1713425886033-91a7d74b26a5?auto=format&fit=crop&w=500&q=85" }
];

const brands = ["Aura", "Studio Nari", "Linen & Co", "Petal", "Kōan", "Verve", "Maison Lune", "Terra"];
const adjectives = ["Silk Blend", "Handwoven", "Organic Cotton", "Draped", "Embroidered", "Structured", "Airy", "Tailored", "Signature", "Classic"];

const categoryImagePools = {
  "sarees": ["https://images.unsplash.com/photo-1776504768745-551029df100d?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1638456286433-79766945a656?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1738690940173-e16fee805fe9?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1693382507826-e1ee4140f6a7?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1717835429626-d6dd3f2c9afb?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1597897545901-6ac15b725974?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1763017707725-a9854affe474?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1738690789530-9c5ee199575c?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1680711552692-76a8bd810398?auto=format&fit=crop&w=900&q=85"],
  "kurtis": ["https://images.unsplash.com/photo-1742800786544-e935375035e3?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1754391851702-e5275cf80e34?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1766994063823-ed214f883548?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1754641600710-16c1ba3894c6?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1742800788220-1e42256d6022?auto=format&fit=crop&w=900&q=85", 36311379, 8770996, 28512776, 13178920, 35521738, 36567501, 28512787],
  "skirts": ["https://images.unsplash.com/photo-1561932850-f13404855e53?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1783095628724-c6036ce0ce70?auto=format&fit=crop&w=900&q=85", 764872, 22468578, 16986581, 22819845, 5848788, 11530922, 19510476, 5542969, 8950053, 27208599],
  "tops": ["https://images.unsplash.com/photo-1735855335518-5a05da0730b4?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1717766293792-e78ea97e9d68?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1724403467796-73725db14284?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1683849117195-83517b362436?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1527723503749-9e61addd1b3e?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1715541448115-3be2097950fa?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1548176450-5196b4c0816b?auto=format&fit=crop&w=900&q=85", 2059051, 12678479, 2859381, 20736190, 20483777],
  "western-wear": [31410216, 14801160, 21879348, 8306375, 8386652, "https://images.unsplash.com/photo-1760551600273-bca4b15907d0?auto=format&fit=crop&w=900&q=85", 3946692, 15595670, 15345385, 10882067, 2884299],
  "skincare": skincareImages,
  "makeup": [2586073, 2536009, 2535913, 2633986, 2535928, 2547462, 2517447, 2587363, 2517881, 2587370],
  "shoes": [27113457, 27113458, 27113460, 27113465, 27113462, 26965810, 27113463, 26796158, 27113459, 26965813],
  "jewelry": ["https://images.unsplash.com/photo-1632525231035-c054cd5019db?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1662833832755-177c2ceb7869?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1774978239401-7bfaff4207ee?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1720528347553-5a251993ee00?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1623133343364-04d1d1a26fcb?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1778182530965-b7dd00070c17?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1787022087854-177d08846b9e?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1767921777873-81818b812a4d?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1778148046789-8e3a677eebbd?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1617191880362-aac615de3c26?auto=format&fit=crop&w=900&q=85"],
  "minimal-jewelry": ["https://images.unsplash.com/photo-1778000001290-0b67eeb2fbc2?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1632525231035-c054cd5019db?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1662833832755-177c2ceb7869?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1767921777873-81818b812a4d?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1770643661899-bf150b61789e?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1562819440-91870f5559d9?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1645748655092-74df6b5e93e0?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1623133343364-04d1d1a26fcb?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?auto=format&fit=crop&w=900&q=85"],
  "accessories": ["https://images.unsplash.com/photo-1771695838794-d3139108b1cd?auto=format&fit=crop&w=900&q=85", 2761038, 9558700, 1697214, 1667088, 3641056, 8651787, 12569725, 11506572, 15035198, 2883138, 16353877],
  "handbags": [16353877, "https://images.unsplash.com/photo-1713425886033-91a7d74b26a5?auto=format&fit=crop&w=900&q=85", 3808249, "https://images.unsplash.com/photo-1559127452-cb4ef7888fa1?auto=format&fit=crop&w=900&q=85", 1152077, 4830930, 26918698, 30056477, 932401, 6787035, 28775829]
};

const nounsByCategory = {
  "sarees": ["Silk Saree", "Banarasi Saree", "Cotton Handloom Saree", "Chiffon Saree", "Georgette Saree", "Linen Saree", "Kanjivaram Saree", "Organza Saree", "Tussar Silk Saree", "Printed Saree"],
  "kurtis": ["Straight Kurti", "A-Line Kurti", "Anarkali Kurti", "Kurti Set", "Printed Kurti", "Embroidered Kurti", "Cotton Kurti", "Chikankari Kurti", "Kurta Palazzo Set", "Kurti with Dupatta"],
  "skirts": ["Midi Skirt", "Maxi Skirt", "Pleated Skirt", "A-Line Skirt", "Wrap Skirt", "Denim Skirt", "Flared Skirt", "Pencil Skirt", "Tiered Skirt", "Satin Skirt"],
  "tops": ["Wrap Top", "Blouse", "Crop Top", "Tunic Top", "Peplum Top", "Off-Shoulder Top", "Tie-Front Top", "Puff Sleeve Top", "Linen Top", "Knit Top"],
  "western-wear": ["Co-ord Set", "Jumpsuit", "Shift Dress", "Wide-Leg Trousers", "Denim Jacket", "Blazer Set", "Culottes Set", "Bodycon Dress", "Palazzo Set", "Playsuit"],
  "skincare": ["Face Serum", "Vitamin C Serum", "Daily Moisturizer", "Facial Cleanser", "Sunscreen SPF50", "Under Eye Cream", "Clay Face Mask", "Hydrating Toner", "Lip Balm", "Overnight Repair Cream", ...newSkincareProducts.map(product => product.name)],
  "makeup": ["Kajal", "Matte Lipstick", "Liquid Foundation", "Compact Powder", "Eyeliner", "Volumizing Mascara", "Cream Blush", "Highlighter Palette", "Lip Gloss", "Makeup Primer"],
  "shoes": ["Leather Loafers", "Ballet Flats", "Block Heels", "Casual Sneakers", "Flat Sandals", "Wedge Heels", "Stiletto Heels", "Ankle Boots", "Espadrilles", "Slip-On Mules"],
  "jewelry": ["Gold Hoop Earrings", "Statement Necklace", "Kundan Ring", "Gold Bangles Set", "Choker Necklace", "Jhumka Earrings", "Bridal Necklace Set", "Pearl Ring", "Temple Jewelry Set", "Charm Bracelet"],
  "minimal-jewelry": ["Layered Chain Necklace", "Dainty Stud Earrings", "Minimal Band Ring", "Delicate Bracelet", "Simple Pendant Necklace", "Thin Stacking Bangle", "Minimalist Anklet", "Tiny Hoop Earrings", "Bar Necklace", "Stacking Ring Set"],
  "accessories": ["Silk Scarf", "Cat-Eye Sunglasses", "Analog Wrist Watch", "Leather Belt", "Hair Clip Set", "Woven Straw Hat", "Printed Stole", "Beaded Hairband", "Aviator Sunglasses", "Woven Waist Belt"],
  "handbags": ["Woven Straw Tote", "Structured Handbag", "Sling Bag", "Evening Clutch", "Crossbody Bag", "Embroidered Potli Bag", "Mini Backpack", "Bucket Bag", "Embellished Clutch", "Leather Satchel"]
};

const materialByCategory = {
  "sarees": "Pure silk / handloom blend", "kurtis": "Cotton blend", "skirts": "Cotton-linen blend",
  "tops": "Rayon / linen blend", "western-wear": "Cotton-poly blend", "skincare": "Dermat-tested formula",
  "makeup": "Skin-safe, cruelty-free formula", "shoes": "Vegan leather", "jewelry": "22k gold plated / kundan",
  "minimal-jewelry": "Sterling silver / gold vermeil", "accessories": "Mixed natural materials", "handbags": "Vegan leather / woven jute"
};

const careByCategory = {
  "sarees": "Dry clean only", "kurtis": "Gentle machine wash", "skirts": "Hand wash recommended",
  "tops": "Machine wash cold", "western-wear": "Dry clean recommended", "skincare": "Store in a cool, dry place",
  "makeup": "Store away from direct sunlight", "shoes": "Wipe clean with a soft cloth", "jewelry": "Keep away from water & perfume",
  "minimal-jewelry": "Keep away from water & perfume", "accessories": "Spot clean only", "handbags": "Wipe clean with a soft cloth"
};

const descByCategory = {
  "sarees": "A quiet, considered drape cut from breathable fabric with a delicately finished border, designed to move easily from morning gatherings to evening events.",
  "kurtis": "An everyday essential tailored for comfort and ease, finished with subtle detailing that pairs effortlessly with leggings, palazzos or denim.",
  "skirts": "A versatile silhouette that transitions from desk to dinner, cut in a breathable fabric that moves with you.",
  "tops": "A wardrobe staple with a considered fit and soft-touch fabric, easy to dress up or down.",
  "western-wear": "A modern, tailored piece designed for the woman on the move — polished, comfortable and effortlessly chic.",
  "skincare": "A dermatologist-approved formula crafted with clean, gentle ingredients for visible results without irritation.",
  "makeup": "A long-wear, skin-safe formula that blends effortlessly for a natural, radiant finish.",
  "shoes": "A comfort-first silhouette crafted from premium materials, designed to carry you through a full day in style.",
  "jewelry": "A statement piece finished by hand with fine detailing, made to elevate both festive and everyday looks.",
  "minimal-jewelry": "A delicate, understated piece designed for everyday layering — quietly elegant, never loud.",
  "accessories": "A finishing touch crafted from quality materials, designed to complete any look with ease.",
  "handbags": "A considered accessory that balances everyday function with a refined, timeless silhouette."
};

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    const [existingProducts, existingCategories] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments()
    ]);
    if (existingProducts || existingCategories) {
      throw new Error(
        `Database already contains ${existingProducts} products and ${existingCategories} categories. ` +
        'Seeding stopped to protect existing data; it only runs on an empty catalog.'
      );
    }

    console.log('Seeding categories...');
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`${insertedCategories.length} categories seeded successfully!`);

    console.log('Generating and seeding products...');
    const productsToSeed = [];
    let productIndex = 0;

    for (const cat of categoriesData) {
      const pool = categoryImagePools[cat.slug];
      const nouns = nounsByCategory[cat.slug];
      
      // Seed between 8 and 12 products per category (exactly like frontend does)
      const count = cat.slug === 'skincare' ? newSkincareProducts.length + 10 : Math.max(8, Math.min(pool.length, 12));
      for (let i = 0; i < count; i++) {
        const noun = nouns[i % nouns.length];
        const brand = brands[productIndex % brands.length];
        const adjective = adjectives[i % adjectives.length];
        const name = cat.slug === 'skincare' && i >= 10
          ? newSkincareProducts[i - 10].name
          : `${adjective} ${noun}`;
        
        // Match mathematical generation formulas from original HTML code:
        const base = 799 + ((productIndex * 173) % 4700);
        const hasDiscount = productIndex % 3 !== 0;
        const discountPct = hasDiscount ? [10, 15, 20, 25, 30][productIndex % 5] : 0;
        const price = hasDiscount ? Math.round(base * (1 - discountPct / 100)) : base;
        
        // Pexels gallery images mapping:
        const imgIds = [pool[i % pool.length]];
        const imageUrl = (value, width) => typeof value === 'string'
          ? value.replace('w=900', `w=${width}`)
          : `https://images.pexels.com/photos/${value}/pexels-photo-${value}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
        
        const rating = (3.8 + (productIndex % 12) * 0.1).toFixed(1);
        const reviewsCount = 20 + (productIndex * 7) % 340;

        const specMap = {
          'Material': materialByCategory[cat.slug],
          'Care': careByCategory[cat.slug],
          'Origin': 'Made in India'
        };

        const product = {
          name,
          brand,
          category: cat.name,
          categorySlug: cat.slug,
          price,
          oldPrice: hasDiscount ? base : null,
          discountPct,
          rating: parseFloat(rating),
          reviews: reviewsCount,
          images: imgIds.map(iid => imageUrl(iid, 700)),
          img: imageUrl(imgIds[0], 500),
          stock: productIndex % 9 === 0 ? "low" : "in",
          material: materialByCategory[cat.slug],
          care: careByCategory[cat.slug],
          desc: descByCategory[cat.slug],
          specifications: specMap
        };

        productsToSeed.push(product);
        productIndex++;
      }
    }

    const insertedProducts = await Product.insertMany(productsToSeed);
    console.log(`${insertedProducts.length} products seeded successfully!`);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
