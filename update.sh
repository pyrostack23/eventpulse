#!/bin/bash

# Quick Update Script - No Build

set -e

echo "Updating EventPulse..."

# Update backend dependencies only
cd /var/www/eventpulse/backend
npm install --production --no-optional

# Restart app
pm2 restart eventpulse-backend

echo "✓ Update complete!"
pm2 status
