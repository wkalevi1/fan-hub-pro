const mongoose = require('mongoose');
const Outfit = require('./models/Outfit');
const Question = require('./models/Question');
const Wallpaper = require('./models/Wallpaper');
const Fan = require('./models/Fan');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Outfit.deleteMany({});
    await Question.deleteMany({});
    await Wallpaper.deleteMany({});
    await Fan.deleteMany({});
    
    console.log('Cleared existing data');

    // Seed Outfits
    const outfits = await Outfit.insertMany([
      {
        title: "Golden Hour Athleisure",
        imageUrl: "https://images.unsplash.com/photo-1643633807086-ebb17d55f97e",
        votes: 156
      },
      {
        title: "Minimal Chic Workout",
        imageUrl: "https://images.unsplash.com/photo-1684225357508-a66ce1dab44c",
        votes: 134
      },
      {
        title: "Fresh Blue Vibes",
        imageUrl: "https://images.unsplash.com/photo-1684225358843-54b1132537b6",
        votes: 98
      },
      {
        title: "Pure White Elegance",
        imageUrl: "https://images.unsplash.com/photo-1684225359433-3751af11f88f",
        votes: 87
      },
      {
        title: "Sporty Glam",
        imageUrl: "https://images.pexels.com/photos/33680787/pexels-photo-33680787.jpeg",
        votes: 45
      },
      {
        title: "Casual Luxe",
        imageUrl: "https://images.pexels.com/photos/33680792/pexels-photo-33680792.jpeg",
        votes: 34
      }
    ]);
    
    console.log('Seeded outfits:', outfits.length);

    // Seed Questions
    const questions = await Question.insertMany([
      {
        fanName: "MariaFit",
        text: "¿Cuál es tu rutina favorita para glúteos?",
        answer: "Mi rutina favorita incluye sentadillas búlgaras, hip thrusts y patadas de glúteo. La clave está en la progresión y la constancia. Siempre recomiendo empezar con peso corporal y luego agregar resistencia gradualmente."
      },
      {
        fanName: "AnaWorkout",
        text: "¿Cómo mantienes la motivación todos los días?",
        answer: "https://images.unsplash.com/photo-1512005286309-e5b890ca36b6"
      },
      {
        fanName: "SofiaHealth",
        text: "¿Qué suplementos recomiendas?",
        answer: "Para mí, los básicos son: proteína whey post-entreno, creatina monohidrato, omega 3 y un buen multivitamínico. Siempre consulta con un profesional antes de empezar cualquier suplementación."
      },
      {
        fanName: "CarlaStyle",
        text: "¿Cuál es tu outfit favorito para entrenar?",
        answer: "https://images.unsplash.com/photo-1708011087528-e287b6ec6628"
      }
    ]);
    
    console.log('Seeded questions:', questions.length);

    // Seed Wallpapers
    const wallpapers = await Wallpaper.insertMany([
      {
        title: "Golden Hour Dreams",
        imageUrl: "https://images.unsplash.com/photo-1512005286309-e5b890ca36b6",
        downloads: 247
      },
      {
        title: "Sunset Strength",
        imageUrl: "https://images.unsplash.com/photo-1708011087528-e287b6ec6628",
        downloads: 189
      },
      {
        title: "Beach Vibes",
        imageUrl: "https://images.unsplash.com/photo-1702769446330-6debb427d3b3",
        downloads: 156
      },
      {
        title: "Fashion Forward",
        imageUrl: "https://images.unsplash.com/photo-1640500515656-344e5512c87c",
        downloads: 134
      },
      {
        title: "Premium Lifestyle",
        imageUrl: "https://images.pexels.com/photos/32448466/pexels-photo-32448466.jpeg",
        downloads: 98
      },
      {
        title: "Golden Aesthetic",
        imageUrl: "https://images.pexels.com/photos/33666880/pexels-photo-33666880.jpeg",
        downloads: 87
      },
      {
        title: "Fashion Portrait",
        imageUrl: "https://images.pexels.com/photos/33681182/pexels-photo-33681182.jpeg",
        downloads: 76
      },
      {
        title: "Elegant Style",
        imageUrl: "https://images.pexels.com/photos/33681181/pexels-photo-33681181.jpeg",
        downloads: 65
      }
    ]);
    
    console.log('Seeded wallpapers:', wallpapers.length);

    // Seed Fans
    const fans = await Fan.insertMany([
      {
        username: "StephanieFan123",
        email: "fan1@example.com",
        points: 250,
        isTopFan: true
      },
      {
        username: "FitnessQueen",
        email: "fan2@example.com", 
        points: 180,
        isTopFan: true
      },
      {
        username: "GoldenHourLover",
        email: "fan3@example.com",
        points: 145,
        isTopFan: true
      },
      {
        username: "WorkoutBuddy",
        email: "fan4@example.com",
        points: 89,
        isTopFan: false
      },
      {
        username: "StyleIcon",
        email: "fan5@example.com",
        points: 67,
        isTopFan: false
      }
    ]);
    
    console.log('Seeded fans:', fans.length);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();