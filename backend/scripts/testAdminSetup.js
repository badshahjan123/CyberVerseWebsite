const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 CyberVerse Admin Panel Diagnostic Tool');
console.log('='.repeat(50));
console.log('');

async function runDiagnostics() {
  try {
    // Step 1: Check files
    console.log('Step 1: Checking required files...');
    const files = [
      'routes/adminAuth.js',
      'middleware/cookieAuth.js',
      'models/User.js',
      'scripts/checkAdminUser.js',
      'scripts/createAdminUser.js',
    ];

    let allFilesExist = true;
    for (const file of files) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} (missing)`);
        allFilesExist = false;
      }
    }
    console.log('');

    if (!allFilesExist) {
      console.log('⚠️  Some required files are missing');
      return;
    }

    // Step 2: Check .env
    console.log('Step 2: Checking .env configuration...');
    if (!fs.existsSync('.env')) {
      console.log('❌ .env file not found');
      return;
    }

    const envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('JWT_SECRET')) {
      console.log('✅ JWT_SECRET configured');
    } else {
      console.log('⚠️  JWT_SECRET not found in .env');
    }

    if (envContent.includes('MONGODB_URI')) {
      console.log('✅ MONGODB_URI configured');
    } else {
      console.log('⚠️  MONGODB_URI not found in .env');
    }
    console.log('');

    // Step 3: Check MongoDB
    console.log('Step 3: Testing MongoDB connection...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB connection successful');
      
      // Step 4: Check admin user
      console.log('');
      console.log('Step 4: Checking admin user in database...');
      const User = require('../models/User');
      const adminUsers = await User.find({ role: 'admin' });
      
      if (adminUsers.length === 0) {
        console.log('❌ No admin users found');
        console.log('   Fix: Run "node scripts/createAdminUser.js"');
      } else {
        console.log(`✅ Found ${adminUsers.length} admin user(s):`);
        adminUsers.forEach(user => {
          console.log(`   - ${user.name} (${user.email})`);
        });
      }
      
    } catch (mongoError) {
      console.log('❌ MongoDB connection failed');
      console.log(`   Error: ${mongoError.message}`);
      console.log('   Check: MONGODB_URI in .env');
    }

  } catch (error) {
    console.error('Error during diagnostics:', error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
    console.log('');
    console.log('='.repeat(50));
    console.log('🎉 Diagnostic Complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. If admin user missing:');
    console.log('   node scripts/createAdminUser.js');
    console.log('');
    console.log('2. Start backend server:');
    console.log('   npm start');
    console.log('');
    console.log('3. Start frontend (in another terminal):');
    console.log('   cd frontend && npm run dev');
    console.log('');
    console.log('4. Visit: http://localhost:5173/secure-admin-login');
    process.exit(0);
  }
}

runDiagnostics();