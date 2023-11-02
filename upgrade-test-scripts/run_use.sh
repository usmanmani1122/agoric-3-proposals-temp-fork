#!/bin/bash
# Starts agd in the background and runs action.sh against it in the foreground
# Note that STDOUT mixes the two. TODO separate them cleanly with log output.

set -e

source ./env_setup.sh

export SLOGFILE=slog.slog

PROPOSAL_PATH=$1

startAgd

echo "Agd started. Running use.sh."
cd /usr/src/proposals/"$PROPOSAL_PATH/" || exit
./use.sh

echo "Actions completed. Running for a few blocks and exiting."
waitForBlock 5
