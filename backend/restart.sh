#!/bin/bash
echo "Restarting backend server..."
pkill -f "nest start"
sleep 3
cd /mnt/d/code/OpenCompliance Counsel/backend
npm run start:dev &
echo "Backend server restarting in background"
