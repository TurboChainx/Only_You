const mongoose = require('mongoose');
const Character = require('../src/models/Character');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dbforyou', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Character updates with image URLs
const characterUpdates = [
  {
    name: 'Olivia Parker',
    profileImage: 'http://localhost:5000/uploads/characters/olivia-parker.jpg'
  },
  {
    name: 'Emily Walker',
    profileImage: 'http://localhost:5000/uploads/characters/emily-walker.jpg'
  },
  {
    name: 'Chloe Bennett',
    profileImage: 'http://localhost:5000/uploads/characters/chloe-bennett.jpg'
  },
  {
    name: 'Sophia Mitchell',
    profileImage: 'http://localhost:5000/uploads/characters/sophia-mitchell.jpg'
  },
  {
    name: 'Mia Thompson',
    profileImage: 'http://localhost:5000/uploads/characters/mia-thompson.jpg'
  }
];

async function updateCharacterImages() {
  try {
    console.log('Updating character profile images...\n');
    
    for (const update of characterUpdates) {
      const result = await Character.updateOne(
        { name: update.name },
        { $set: { profileImage: update.profileImage } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✓ Updated ${update.name} with profile image`);
      } else {
        console.log(`- Character not found: ${update.name}`);
      }
    }
    
    console.log('\n✅ Character images updated successfully!');
    
    // Display updated characters
    const characters = await Character.find({});
    console.log('\n📸 Updated Characters:');
    characters.forEach(char => {
      console.log(`- ${char.name}: ${char.profileImage || 'No image'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating characters:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateCharacterImages();
