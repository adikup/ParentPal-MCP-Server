#!/bin/bash

# Change to the script's directory
cd "$(dirname "$0")"

# Use Node v20.19.4 (or higher) which supports --import flag
export PATH="/Users/adigoffer/.nvm/versions/node/v20.19.4/bin:$PATH"

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Run the server with tsx directly (stdio version for MCP)
exec node_modules/.bin/tsx src/server-stdio.ts

