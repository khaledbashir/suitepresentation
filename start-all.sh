#!/bin/bash

# Start BlockSuite editor on port 3004
cd /root/suitepresentation/packages/blocksuite-editor
pnpm dev &
BLOCKSUITE_PID=$!

# Start main app on port 3001
cd /root/suitepresentation
pnpm dev &
MAIN_PID=$!

echo "🚀 Started BlockSuite editor on http://localhost:3004"
echo "🚀 Started main app on http://localhost:3001"
echo ""
echo "📊 Main App: Chat + Spreadsheet"
echo "📝 BlockSuite: Isolated editor"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BLOCKSUITE_PID $MAIN_PID
