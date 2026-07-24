const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');

const categoriesData = [
  { slug: "sarees", name: "Sarees", img: "https://images.pexels.com/photos/27918892/pexels-photo-27918892.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "kurtis", name: "Kurtis", img: "https://images.pexels.com/photos/13178920/pexels-photo-13178920.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "skirts", name: "Skirts", img: "https://images.pexels.com/photos/25466385/pexels-photo-25466385.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "tops", name: "Tops", img: "https://images.pexels.com/photos/37466294/pexels-photo-37466294.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "western-wear", name: "Western Wear", img: "https://images.pexels.com/photos/31410216/pexels-photo-31410216.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "skincare", name: "Skincare", img: "https://images.pexels.com/photos/34939732/pexels-photo-34939732.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "makeup", name: "Makeup", img: "https://images.pexels.com/photos/2586073/pexels-photo-2586073.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "shoes", name: "Shoes", img: "https://images.pexels.com/photos/27113457/pexels-photo-27113457.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "jewelry", name: "Jewelry", img: "https://images.pexels.com/photos/13595793/pexels-photo-13595793.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "minimal-jewelry", name: "Minimal Jewelry", img: "https://images.pexels.com/photos/21787515/pexels-photo-21787515.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "accessories", name: "Accessories", img: "https://images.pexels.com/photos/16353877/pexels-photo-16353877.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { slug: "handbags", name: "Handbags", img: "https://images.pexels.com/photos/4830930/pexels-photo-4830930.jpeg?auto=compress&cs=tinysrgb&w=400" }
];

const brands = ["Aura", "Studio Nari", "Linen & Co", "Petal", "Kōan", "Verve", "Maison Lune", "Terra"];
const adjectives = ["Silk Blend", "Handwoven", "Organic Cotton", "Draped", "Embroidered", "Structured", "Airy", "Tailored", "Signature", "Classic"];

const categoryImagePools = {
  "sarees": [28939776, 19015918, 18035310, 29996312, 19015925, 17768355, 18035302, 18456786, 28428044, 14765915, 28706341, 28428039],
  "kurtis": [36311379, 8770996, 28512776, 13178920, 35521738, 36567501, 28512787, 37523793, 28213774, 37523792, 37523801, 20702676],
  "skirts": [5848788, 11530922, 19510476, 5542969, 8950053, 27208599, 17967726, 36730400, 19932178, 20008026, 18693642, 20167615],
  "tops": [20483777, 29527343, 15758653, 5713294, 10462543, 10462527, 10512915, 9172606, 26100325, 13915356, 16365010, 2666467],
  "western-wear": [31410216, 14801160, 21879348, 8306375, 8386652, 10007478, 3946692, 15595670, 15345385, 10882067, 2884299],
  "skincare": [34939732, 34939731, 34939730, 34939729, 34939728, 34939704, 34939759, 34939761, 34939760, 34939727],
  "makeup": [2586073, 2536009, 2535913, 2633986, 2535928, 2547462, 2517447, 2587363, 2517881, 2587370],
  "shoes": [27113457, 27113458, 27113460, 27113465, 27113462, 26965810, 27113463, 26796158, 27113459, 26965813],
  "jewelry": [13595793, 12144990, 20858959, 13924051, 10862233, 12133990, 33737462, 10937834, 8003772, 34444125, 18597841, 19646999],
  "minimal-jewelry": [21787515, 9645737, 15925159, 4735885, 7514818, 10441397, 10804840, 7407595, 8105125],
  "accessories": [16353877, 2761038, 9558700, 1697214, 1667088, 3641056, 8651787, 12569725, 11506572, 15035198, 2883138, 7901774],
  "handbags": [4830930, 5745781, 3808249, 26925244, 1152077, 1152078, 26918698, 30056477, 932401, 6787035, 28775829]
};

const nounsByCategory = {
  "sarees": ["Silk Saree", "Banarasi Saree", "Cotton Handloom Saree", "Chiffon Saree", "Georgette Saree", "Linen Saree", "Kanjivaram Saree", "Organza Saree", "Tussar Silk Saree", "Printed Saree"],
  "kurtis": ["Straight Kurti", "A-Line Kurti", "Anarkali Kurti", "Kurti Set", "Printed Kurti", "Embroidered Kurti", "Cotton Kurti", "Chikankari Kurti", "Kurta Palazzo Set", "Kurti with Dupatta"],
  "skirts": ["Midi Skirt", "Maxi Skirt", "Pleated Skirt", "A-Line Skirt", "Wrap Skirt", "Denim Skirt", "Flared Skirt", "Pencil Skirt", "Tiered Skirt", "Satin Skirt"],
  "tops": ["Wrap Top", "Blouse", "Crop Top", "Tunic Top", "Peplum Top", "Off-Shoulder Top", "Tie-Front Top", "Puff Sleeve Top", "Linen Top", "Knit Top"],
  "western-wear": ["Co-ord Set", "Jumpsuit", "Shift Dress", "Wide-Leg Trousers", "Denim Jacket", "Blazer Set", "Culottes Set", "Bodycon Dress", "Palazzo Set", "Playsuit"],
  "skincare": ["Face Serum", "Vitamin C Serum", "Daily Moisturizer", "Facial Cleanser", "Sunscreen SPF50", "Under Eye Cream", "Clay Face Mask", "Hydrating Toner", "Lip Balm", "Overnight Repair Cream"],
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

    console.log('Clearing database collections...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Existing products and categories cleared.');

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
      const count = Math.max(8, Math.min(pool.length, 12));
      for (let i = 0; i < count; i++) {
        const noun = nouns[i % nouns.length];
        const brand = brands[productIndex % brands.length];
        const adjective = adjectives[i % adjectives.length];
        const name = `${adjective} ${noun}`;
        
        // Match mathematical generation formulas from original HTML code:
        const base = 799 + ((productIndex * 173) % 4700);
        const hasDiscount = productIndex % 3 !== 0;
        const discountPct = hasDiscount ? [10, 15, 20, 25, 30][productIndex % 5] : 0;
        const price = hasDiscount ? Math.round(base * (1 - discountPct / 100)) : base;
        
        // Pexels gallery images mapping:
        const imgIds = [
          pool[i % pool.length], 
          pool[(i + 3) % pool.length], 
          pool[(i + 6) % pool.length]
        ];
        
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
          images: imgIds.map(iid => `https://images.pexels.com/photos/${iid}/pexels-photo-${iid}.jpeg?auto=compress&cs=tinysrgb&w=700`),
          img: `https://images.pexels.com/photos/${imgIds[0]}/pexels-photo-${imgIds[0]}.jpeg?auto=compress&cs=tinysrgb&w=500`,
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
