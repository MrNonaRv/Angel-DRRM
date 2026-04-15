#!/bin/bash

echo "=========================================="
echo "  Mambusao DRRM Inventory System Setup"
echo "=========================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed."
    echo "Please download and install it from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[1/2] Node.js found."
echo "[2/2] Installing dependencies (this may take a minute)..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Dependency installation failed. Check your internet connection."
    exit 1
fi

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "  You can now use './run.sh' to start the app."
echo "=========================================="
echo ""
chmod +x run.sh 2>/dev/null
