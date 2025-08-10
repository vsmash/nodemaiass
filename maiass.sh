#!/bin/bash
# MAIASS wrapper script for better shell compatibility

# Get the directory where this script is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the maiass command
node "$DIR/maiass.mjs" "$@"
