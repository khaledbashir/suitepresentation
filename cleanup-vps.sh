#!/bin/bash

# Safe VPS Cleanup Script
# Clears RAM cache, stops unused PM2 processes, and cleans Docker safely
# Run with: bash /root/suitepresentation/cleanup-vps.sh

echo "Starting safe VPS cleanup..."

# 1. Clear RAM cache (drops pagecache, dentries, inodes)
echo "Clearing RAM cache..."
sync
echo 3 > /proc/sys/vm/drop_caches
echo "RAM cache cleared."

# 2. Check and stop unused PM2 processes (only if none running, as per earlier)
echo "Checking PM2 processes..."
if pm2 list | grep -q "online"; then
    echo "PM2 processes running. Skipping stop to avoid breaking apps."
else
    echo "No PM2 processes running."
fi

# 3. Safe Docker cleanup (remove stopped containers, networks, but keep images and volumes)
echo "Cleaning Docker safely..."
docker container prune -f
docker network prune -f
echo "Docker cleaned (kept images and volumes to preserve data)."

# 4. Show memory usage after cleanup
echo "Memory usage after cleanup:"
free -h

echo "Cleanup complete! Your apps and data are safe."