#!/bin/bash

# Exit when any command fails
set -e

source /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh

ls -al

yarn install

yarn ava --serial pre.test.js actions.test.js

./legacy.sh
