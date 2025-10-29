// Firebase seeding script
// Run this after setting up your Firebase project to populate initial data

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');

// Import skills data
const { SKILLS_DATABASE } = require('../src/data/skillsDatabase.ts');

// Firebase configuration (make sure to update this with your real config)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

async function seedFirebase() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Seeding skills collection...');
    
    // Create skills collection with all skills from the database
    const allSkills = SKILLS_DATABASE.flatMap(category => category.skills);
    
    await setDoc(doc(db, 'skills', 'en'), {
      items: allSkills,
      locale: 'en',
      categories: SKILLS_DATABASE.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        skills: cat.skills
      })),
      updatedAt: new Date()
    });

    console.log('✅ Skills collection seeded successfully');
    console.log(`📊 Added ${allSkills.length} skills across ${SKILLS_DATABASE.length} categories`);
    
    // You can add more seeding here if needed
    // For example: default admin users, sample data, etc.
    
    console.log('🎉 Firebase seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding Firebase:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFirebase();