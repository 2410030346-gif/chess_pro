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

echo "✅ Build complete!"
echo "📁 Checking build output..."
ls -la dist/
echo "📂 Current directory: $(pwd)"
echo "📂 Project root files:"
cd ..
ls -la
echo "📂 Client dist files:"
ls -la client/dist/ || echo "❌ client/dist not found!"
echo "✅ Server ready in server/"
