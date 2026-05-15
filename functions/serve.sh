#!/bin/bash
cleanup() {
  echo "Cleaning up port 8085..."
  fuser -k 8085/tcp 2>/dev/null
  exit
}
trap cleanup SIGINT SIGTERM
fuser -k 9000/tcp 8085/tcp 2>/dev/null
npm run build && cd .. && firebase emulators:start --project ssrtest-cebd9