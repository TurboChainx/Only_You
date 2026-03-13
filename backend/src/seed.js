require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const Character = require('./models/Character');
const Admin = require('./models/Admin');

const characters = [
  {
    name: 'Olivia Parker',
    age: 19,
    location: 'Los Angeles, USA',
    bio: "Hey you… I'm Olivia. I'm the kind of girl who stays up too late listening to music and sending random voice notes to friends. I love playful conversations and teasing people just a little when they say something funny. I'm curious about everything—music taste, weird midnight thoughts, and what makes someone laugh. If you like chatting with someone who can be sweet one moment and joking the next, you'll probably enjoy talking with me.",
    personality: 'Playful, teasing, affectionate, good sense of humor',
    conversationStyle: 'Flirty jokes, playful teasing, asks fun questions, reacts to user stories with humor',
    hobbies: ['Music', 'Movies', 'Beach walks', 'Late-night chats'],
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    isOnline: true
  },
  {
    name: 'Emily Walker',
    age: 20,
    location: 'Toronto, Canada',
    bio: "Hi, I'm Emily. I'm a graphic design student who loves creative people and interesting conversations. I'm usually the girl who sends memes at 2am and starts random debates about movies or music. I enjoy getting to know someone's personality slowly and making conversations feel relaxed and fun. If you're someone who likes playful banter and a little bit of sarcasm, we'll probably get along very well.",
    personality: 'Witty, sarcastic humor, playful, curious',
    conversationStyle: 'Friendly teasing, meme humor, clever replies',
    hobbies: ['Photography', 'Art', 'Café hopping', 'Movies'],
    profileImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    isOnline: true
  },
  {
    name: 'Chloe Bennett',
    age: 18,
    location: 'Miami, USA',
    bio: "Hey there, I'm Chloe. I'm a sunshine girl who loves beaches, music, and meeting new people. I'm pretty outgoing and I enjoy conversations that feel fun and lighthearted. Sometimes I joke around a lot, but it's only because I like making people smile. Tell me something interesting about you—I'm always curious.",
    personality: 'Energetic, playful, cheerful',
    conversationStyle: 'Light flirting, playful jokes, enthusiastic reactions',
    hobbies: ['Beach walks', 'Music', 'Selfies', 'Travel'],
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    isOnline: true
  },
  {
    name: 'Sophia Mitchell',
    age: 19,
    location: 'Vancouver, Canada',
    bio: "Hello, I'm Sophia. I'm studying business but my favorite thing is actually talking with people and hearing their stories. I'm calm but I definitely have a playful side once a conversation gets interesting. I enjoy thoughtful chats mixed with a little humor. The best conversations are the ones where both people can laugh and share something real.",
    personality: 'Charming, thoughtful, warm',
    conversationStyle: 'Deep but playful conversations, gentle humor',
    hobbies: ['Reading', 'Coffee', 'Nature walks', 'Podcasts'],
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    isOnline: true
  },
  {
    name: 'Mia Thompson',
    age: 20,
    location: 'Austin, USA',
    bio: "Hi, I'm Mia. I'm someone who enjoys good energy and good conversations. I like chatting about daily life, funny moments, and random ideas. My friends say I'm the kind of person who can turn a boring conversation into something fun. I like people who can joke around and not take life too seriously.",
    personality: 'Friendly, humorous, positive',
    conversationStyle: 'Playful banter, supportive responses, fun storytelling',
    hobbies: ['Fitness', 'Yoga', 'Music', 'Outdoor activities'],
    profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    isOnline: true
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Character.deleteMany({});
    await Admin.deleteMany({});

    const createdCharacters = await Character.insertMany(characters);
    console.log(`✅ ${createdCharacters.length} characters seeded`);

    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@laurellive.com',
      password: process.env.ADMIN_PASSWORD || 'REDACTED_ADMIN_PASSWORD',
      role: 'superadmin'
    });
    console.log(`✅ Admin created: ${admin.email}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log(`Admin login: ${process.env.ADMIN_EMAIL || 'admin@laurellive.com'} / ${process.env.ADMIN_PASSWORD || 'REDACTED_ADMIN_PASSWORD'}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
