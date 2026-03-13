const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Alternative image URLs for remaining characters
const alternativeImages = [
  {
    name: 'Olivia Parker',
    filename: 'olivia-parker.jpg',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face'
  },
  {
    name: 'Emily Walker', 
    filename: 'emily-walker.jpg',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face'
  }
];

async function downloadRemainingImages() {
  const uploadsDir = path.join(__dirname, 'uploads', 'characters');
  
  console.log('Downloading remaining character images...\n');
  
  for (const image of alternativeImages) {
    try {
      console.log(`Downloading: ${image.name}...`);
      
      const response = await axios.get(image.url, { responseType: 'arraybuffer' });
      const filePath = path.join(uploadsDir, image.filename);
      
      fs.writeFileSync(filePath, response.data);
      console.log(`✓ Downloaded: ${image.name} -> ${image.filename}`);
      
    } catch (error) {
      console.error(`✗ Failed to download image for ${image.name}:`, error.message);
    }
  }
  
  console.log('\n✅ All images downloaded!');
}

downloadRemainingImages().catch(console.error);
