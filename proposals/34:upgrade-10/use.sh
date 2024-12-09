#!/bin/bash

# Exit when any command fails
set -euo pipefail

source /usr/src/upgrade-test-scripts/env_setup.sh

yarn ava pre.test.js

./performActions.js

./legacy.sh
