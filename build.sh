#!/bin/bash
# Build script for Render deployment

echo "📦 Installing server dependencies..."
cd server
npm install

echo "📦 Installing client dependencies..."
cd ../client
npm install

echo "🏗️ Building React frontend..."
npm run build

echo "✅ Build complete! Frontend built to client/dist/"
echo "✅ Server ready in server/"
