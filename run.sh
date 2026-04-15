#!/bin/bash

echo "=========================================="
echo "  Starting Mambusao DRRM Inventory..."
echo "=========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[WARNING] Dependencies not found. Running setup first..."
    ./setup.sh
fi

echo "[INFO] Launching development server..."
npm run dev
