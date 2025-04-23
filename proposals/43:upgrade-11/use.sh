#!/bin/bash

# Exit when any command fails
set -o errexit

source /usr/src/upgrade-test-scripts/env_setup.sh

ls -al

yarn ava pre.test.js

./performActions.js

./restore-pruned-artifacts.sh
