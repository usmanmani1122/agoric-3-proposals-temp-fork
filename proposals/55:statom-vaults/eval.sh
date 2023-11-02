#!/bin/bash

# Exit when any command fails
set -e

source /usr/src/upgrade-test-scripts/env_setup.sh

ls -al

yarn install --frozen-lockfile

# XXX to avoid rebuilding lower layers
# TODO clean up JS lib code so it's more independent
cp package.json yarn.lock /usr/src/upgrade-test-scripts/lib/
cd /usr/src/upgrade-test-scripts/lib/ && yarn install --frozen-lockfile
cd -

# XXX using Ava serial to script the core-eval
yarn ava add-collateral.test.js
