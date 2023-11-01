#!/bin/bash

# Exit when any command fails
set -e

source /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh

ls -al

yarn install

yarn ava 43:upgrade-11/pre.test.js

./performActions.js

./legacy.sh
