#!/bin/bash

# Remove node_modules and reinstall dependencies
echo "Removing node_modules..."
rm -rf node_modules
rm -rf .yarn/cache
rm -rf .yarn/unplugged
rm -rf .yarn/install-state.gz

# Install dependencies using npm instead of yarn
echo "Installing dependencies with npm..."
npm install

# Install specific packages that might be missing
echo "Installing specific packages..."
npm install react-icons axios miragejs

echo "Dependencies reinstalled. Please run 'npm start' to start the application." 