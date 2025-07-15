#!/bin/bash

# Azure startup script for Node.js with ES Modules
echo "Starting Node.js application with ES Modules..."

# Set environment variables for Azure
export NODE_ENV=production

echo "Environment variables set:"
echo "NODE_ENV: $NODE_ENV"

# Start the application (ES modules work better with Azure SSL)
node index.js
