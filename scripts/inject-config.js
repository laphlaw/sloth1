#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.production
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '../.env.production');
dotenv.config({ path: envPath });

// Read the template config
const configPath = path.join(__dirname, '../build/config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace placeholders with actual values from environment
configContent = configContent
  .replace('FIREBASE_API_KEY', process.env.REACT_APP_FIREBASE_API_KEY || '')
  .replace('FIREBASE_AUTH_DOMAIN', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '')
  .replace('FIREBASE_PROJECT_ID', process.env.REACT_APP_FIREBASE_PROJECT_ID || '')
  .replace('FIREBASE_STORAGE_BUCKET', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '')
  .replace('FIREBASE_MESSAGING_SENDER_ID', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '')
  .replace('FIREBASE_APP_ID', process.env.REACT_APP_FIREBASE_APP_ID || '')
  .replace('STRIPE_PUBLIC_KEY', process.env.REACT_APP_STRIPE_PUBLIC_KEY || '')
  .replace('API_URL', process.env.REACT_APP_API_URL || '');

// Write the configured file
fs.writeFileSync(configPath, configContent);

console.log('Runtime configuration has been injected successfully from .env.production!');
