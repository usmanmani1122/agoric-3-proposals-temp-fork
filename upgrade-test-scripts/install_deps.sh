#!/bin/bash

set -e

PROPOSAL_PATH=$1

# The base image is Node 16.9, which supports Corepack.
# Yarn v4 requires Node 18+ but so far it's working with 16.19.
export YARN_IGNORE_NODE=1

corepack enable
yarn --version

# Run where this script is
cd "$(dirname "$(realpath -- "$0")")"

# TODO consider yarn workspaces to install all in one command
if [ -n "$PROPOSAL_PATH" ]; then
    cd "../proposals/$PROPOSAL_PATH"
    # install only if the proposal has a yarn.lock
    test -n "yarn.lock" && yarn install --immutable
fi
