#!/bin/bash
# Build script for Render deployment

echo "� Current working directory: $(pwd)"
echo "📂 Listing project structure..."
ls -la

echo "�📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "📦 Installing client dependencies..."
cd client
npm install

echo "🏗️ Building React frontend..."
npm run build

echo "✅ Build complete!"
echo "📁 Verifying build output..."
ls -la dist/

echo "📂 Returning to project root..."
cd ..

echo "📂 Final project structure:"
pwd
ls -la

echo "📂 Verifying client/dist exists:"
ls -la client/dist/

echo "✅ All builds complete!"
