const imageIds = [
  '1781343219404-3763ac92c6d3',
  '1597931752949-98c74b5b159f',
  '1777840347880-747242e0db00',
  '1786171167196-7ed6f00b7924',
  '1778451510207-24f1e204f465',
  '1688380338608-a1cb35a6db3a',
  '1772090830289-7699ce4ed388',
  '1782086816100-017c99c45109',
  '1764656424627-1fa7e5e7c2ed',
  '1751831798147-a8c0b2bd9464',
  '1580870069867-74c57ee1bb07',
  '1608248543803-ba4f8c70ae0b',
  '1556228720-195a672e8a03',
  '1571781926291-c477ebfd024b',
  '1611930022073-b7a4ba5fcccd',
  '1601049541289-9b1b7bbbfe19'
];

const images = imageIds.map(id =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=85`
);

const newProducts = [
  { name: 'Barrier Comfort Moisturizer', price: 899, desc: 'A lightweight daily moisturizer for a soft, comfortable finish.' },
  { name: 'Daily Mineral Sunscreen SPF 50', price: 749, desc: 'A simple everyday sunscreen pick for your morning routine.' },
  { name: 'Calm & Clear Foaming Cleanser', price: 599, desc: 'A gentle-feel cleanser designed for an easy start to your routine.' },
  { name: 'Overnight Recovery Cream', price: 999, desc: 'A rich night cream for a comforting end-of-day ritual.' },
  { name: 'Rosewater Hydrating Toner', price: 549, desc: 'A refreshing toner to layer between cleansing and moisturizing.' },
  { name: 'Caffeine Bright Eye Gel', price: 699, desc: 'A cooling gel texture for a light, refreshing eye-care step.' }
];

module.exports = { images, newProducts };
