#!/bin/bash
# Starts agd in the background and runs test.sh against it in the foreground
# Note that STDOUT mixes the two. TODO separate them cleanly with log output.

set -e

source ./env_setup.sh

PROPOSAL=$1
if [ -z "$PROPOSAL" ]; then
    echo "Must specify what proposal to use"
    exit 1
fi

echo "[$PROPOSAL] Starting agd"

startAgd

echo "[$PROPOSAL] Running test.sh."
cd /usr/src/proposals/"$PROPOSAL/" || exit
./test.sh

echo "[$PROPOSAL] Testing completed."
