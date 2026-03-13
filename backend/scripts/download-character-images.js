const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Character profiles with image search terms
const characters = [
  {
    name: 'Olivia Parker',
    age: 19,
    location: 'Los Angeles, USA',
    hobbies: 'Music, movies, beach walks, late-night chats',
    searchTerm: 'beautiful young woman music portrait',
    filename: 'olivia-parker.jpg'
  },
  {
    name: 'Emily Walker',
    age: 20,
    location: 'Toronto, Canada',
    hobbies: 'Photography, art, café hopping, movies',
    searchTerm: 'beautiful young woman art photography portrait',
    filename: 'emily-walker.jpg'
  },
  {
    name: 'Chloe Bennett',
    age: 18,
    location: 'Miami, USA',
    hobbies: 'Beach walks, music, selfies, travel',
    searchTerm: 'beautiful young woman beach sunshine portrait',
    filename: 'chloe-bennett.jpg'
  },
  {
    name: 'Sophia Mitchell',
    age: 19,
    location: 'Vancouver, Canada',
    hobbies: 'Reading, coffee, nature walks, podcasts',
    searchTerm: 'beautiful young woman coffee reading thoughtful portrait',
    filename: 'sophia-mitchell.jpg'
  },
  {
    name: 'Mia Thompson',
    age: 20,
    location: 'Austin, USA',
    hobbies: 'Fitness, yoga, music, outdoor activities',
    searchTerm: 'beautiful young woman fitness yoga portrait',
    filename: 'mia-thompson.jpg'
  }
];

// Using Unsplash API for free high-quality images
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // You'll need to add your key

async function downloadImages() {
  const uploadsDir = path.join(__dirname, 'uploads', 'characters');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  console.log('Downloading character images...\n');
  
  for (const character of characters) {
    try {
      // Search for image
      const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(character.searchTerm)}&per_page=1&orientation=portrait`;
      
      console.log(`Searching for: ${character.name} - ${character.searchTerm}`);
      
      // For demo purposes, using placeholder URLs
      // In production, you'd use actual Unsplash API with your access key
      const imageUrls = {
        'olivia-parker.jpg': 'https://images.unsplash.com/photo-1494790108755-2616b332c0ca?w=400&h=600&fit=crop&crop=face',
        'emily-walker.jpg': 'https://images.unsplash.com/photo-1531746020797-ea659d6a6631?w=400&h=600&fit=crop&crop=face',
        'chloe-bennett.jpg': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face',
        'sophia-mitchell.jpg': 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&crop=face',
        'mia-thompson.jpg': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face'
      };
      
      const imageUrl = imageUrls[character.filename];
      
      if (imageUrl) {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const filePath = path.join(uploadsDir, character.filename);
        
        fs.writeFileSync(filePath, response.data);
        console.log(`✓ Downloaded: ${character.name} -> ${character.filename}`);
      }
      
    } catch (error) {
      console.error(`✗ Failed to download image for ${character.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Image download complete!');
  console.log(`Images saved to: ${uploadsDir}`);
}

// Alternative approach: Create image URLs for the database
function generateImageUrls() {
  const baseUrl = 'http://localhost:5000/uploads/characters/';
  
  characters.forEach(character => {
    console.log(`${character.name}: ${baseUrl}${character.filename}`);
  });
}

if (require.main === module) {
  if (process.argv.includes('--urls')) {
    generateImageUrls();
  } else {
    downloadImages().catch(console.error);
  }
}

module.exports = { characters, downloadImages, generateImageUrls };
