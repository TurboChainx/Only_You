const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Beautiful replacement images with working URLs
const replacementImages = [
  {
    name: 'Mia Thompson',
    filename: 'mia-thompson.jpg',
    // Beautiful fitness/yoga girl - attractive, sporty, warm smile
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face'
  },
  {
    name: 'Sophia Mitchell',
    filename: 'sophia-mitchell.jpg',
    // Beautiful thoughtful girl with coffee/book - intellectual, warm, charming
    url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&crop=face'
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
      
      // Try alternative URLs
      try {
        console.log(`Trying alternative image for ${image.name}...`);
        const alternativeUrl = image.name === 'Mia Thompson' 
          ? 'https://images.unsplash.com/photo-1594736797933-d0acc2196936?w=400&h=600&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face';
          
        const response = await axios.get(alternativeUrl, { responseType: 'arraybuffer' });
        const filePath = path.join(uploadsDir, image.filename);
        
        fs.writeFileSync(filePath, response.data);
        console.log(`✓ Replaced with alternative: ${image.name} -> ${image.filename}`);
      } catch (altError) {
        console.error(`✗ Alternative also failed for ${image.name}:`, altError.message);
      }
    }
  }
  
  console.log('\n✅ Image replacement process complete!');
}

replaceUglyImages().catch(console.error);
