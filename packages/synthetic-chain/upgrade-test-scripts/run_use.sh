#!/bin/bash
# Starts agd in the background and runs action.sh against it in the foreground
# Note that STDOUT mixes the two. TODO separate them cleanly with log output.

set -e

PROPOSAL=$1
if [ -z "$PROPOSAL" ]; then
    echo "Must specify what proposal to use"
    exit 1
fi
PROPOSAL_PROPOSAL="/usr/src/proposals/$PROPOSAL/"

if [ ! -d "$PROPOSAL_PROPOSAL" ]; then
    echo "Proposal $PROPOSAL does not exist"
    exit 1
fi

if [ ! -f "$PROPOSAL_PROPOSAL/use.sh" ]; then
    echo "Proposal $PROPOSAL does not have a use.sh. Skipping."
    exit 0
fi

source ./env_setup.sh

echo "[$PROPOSAL] Starting agd in the background."
startAgd

echo "[$PROPOSAL] Agd started. Running use.sh."
cd "$PROPOSAL_PROPOSAL"
./use.sh

echo "[$PROPOSAL] Actions completed. Running for a few blocks and exiting."
waitForBlock 5
