const axios = require('axios');
const fs = require('fs');
const path = require('path');

// More beautiful replacement images
const beautyImages = [
  {
    name: 'Mia Thompson',
    filename: 'mia-thompson.jpg',
    // Beautiful fitness girl - warm smile, attractive
    urls: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face'
    ]
  },
  {
    name: 'Sophia Mitchell',
    filename: 'sophia-mitchell.jpg',
    // Beautiful thoughtful girl - elegant, charming
    urls: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&h=600&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face'
    ]
  }
];

async function downloadWithRetry(urls, filePath, name) {
  for (const url of urls) {
    try {
      console.log(`  Trying: ${url.substring(0, 60)}...`);
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 10000
      });
      fs.writeFileSync(filePath, response.data);
      console.log(`  ✓ Success!`);
      return true;
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
    }
  }
  return false;
}

async function replaceBeautyImages() {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'characters');
  
  console.log('Replacing with more beautiful images...\n');
  
  for (const image of beautyImages) {
    console.log(`\n📸 ${image.name}:`);
    const filePath = path.join(uploadsDir, image.filename);
    
    const success = await downloadWithRetry(image.urls, filePath, image.name);
    
    if (success) {
      console.log(`✅ Replaced ${image.name} with beautiful image!`);
    } else {
      console.log(`❌ Could not find working image for ${image.name}`);
    }
  }
  
  console.log('\n🎉 Done!');
}

replaceBeautyImages().catch(console.error);
