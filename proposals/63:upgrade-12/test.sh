#!/bin/bash
set -euo pipefail
source /usr/src/upgrade-test-scripts/env_setup.sh

yarn ava post.test.js
