#!/bin/bash#!/bin/bash

set -e# Build script for Render deployment



echo "==> Build started"echo "� Current working directory: $(pwd)"

echo "Working directory: $(pwd)"echo "📂 Listing project structure..."

ls -la

echo "==> Installing server dependencies..."

cd server && npm ci --production=false && cd ..echo "�📦 Installing server dependencies..."

cd server

echo "==> Installing client dependencies..."  npm install

cd client && npm ci --production=falsecd ..



echo "==> Building frontend..."echo "📦 Installing client dependencies..."

npm run buildcd client

npm install

if [ ! -f "dist/index.html" ]; then

  echo "ERROR: Build failed - no index.html"echo "🏗️ Building React frontend..."

  exit 1npm run build

fi

echo "✅ Build complete!"

echo "==> Build output:"echo "📁 Verifying build output..."

ls -lh dist/ls -la dist/

cd ..

echo "📂 Returning to project root..."

echo "==> Verifying final structure..."cd ..

ls -lh client/dist/

echo "📂 Final project structure:"

echo "==> BUILD SUCCESS"pwd

ls -la

echo "📂 Verifying client/dist exists:"
ls -la client/dist/

echo "✅ All builds complete!"
