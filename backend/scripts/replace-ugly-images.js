const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Beautiful replacement images for Mia and Sophia
const replacementImages = [
  {
    name: 'Mia Thompson',
    filename: 'mia-thompson.jpg',
    // Beautiful fitness/yoga girl - attractive, sporty, warm smile
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f08b8d65?w=400&h=600&fit=crop&crop=face'
  },
  {
    name: 'Sophia Mitchell',
    filename: 'sophia-mitchell.jpg',
    // Beautiful thoughtful girl with coffee/book - intellectual, warm, charming
    url: 'https://images.unsplash.com/photo-1494790108755-2616b332c0ca?w=400&h=600&fit=crop&crop=face'
  }
];

async function replaceUglyImages() {
  const uploadsDir = path.join(__dirname, 'uploads', 'characters');
  
  console.log('Replacing ugly images with beautiful ones...\n');
  
  for (const image of replacementImages) {
    try {
      console.log(`Downloading beautiful image for: ${image.name}...`);
      
      const response = await axios.get(image.url, { responseType: 'arraybuffer' });
      const filePath = path.join(uploadsDir, image.filename);
      
      fs.writeFileSync(filePath, response.data);
      console.log(`✓ Replaced: ${image.name} -> ${image.filename}`);
      
    } catch (error) {
      console.error(`✗ Failed to download image for ${image.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Beautiful images downloaded and replaced!');
}

replaceUglyImages().catch(console.error);
