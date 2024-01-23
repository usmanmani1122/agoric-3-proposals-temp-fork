#!/bin/bash
# Starts agd in the background and runs eval.sh against it in the foreground
# Note that STDOUT mixes the two. TODO separate them cleanly with log output.

set -e

source ./env_setup.sh

PROPOSAL_PATH=$1

startAgd

echo "Agd started. Running CoreEval submission."
cd /usr/src/proposals/"$PROPOSAL_PATH/" || exit

# eval_submission doesn't really need to be .ts but it imports .ts files
tsx --version || npm install --global tsx

if [ -f "eval.sh" ]; then
    # this is what the script used to do. Also allows a proposal to override how they are eval-ed
    echo "Running eval.sh"
    ./eval.sh
else
    # newer proposals declare a submission
    echo "Running proposal declared in package.json"
    # copy to run in the proposal package so the dependencies can be resolved
    cp /usr/src/upgrade-test-scripts/eval_submission.ts .
    ./eval_submission.ts
fi

echo "Eval completed. Running 10 blocks and exiting."
waitForBlock 10
