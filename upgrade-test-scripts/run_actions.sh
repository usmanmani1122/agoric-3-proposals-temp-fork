#!/bin/bash
# Starts agd in the background and runs action.sh against it in the foreground
# Note that STDOUT mixes the two. TODO separate them cleanly with log output.

source ./env_setup.sh

export SLOGFILE=slog.slog

PROPOSAL_PATH=$1

startAgd

echo "Agd started. Running actions.sh."
cd /usr/src/proposals/"$PROPOSAL_PATH/" || exit
./actions.sh

echo "Actions completed. Running for a few blocks and exiting."
waitForBlock 5
