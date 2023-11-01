#!/bin/bash
source /usr/src/upgrade-test-scripts/env_setup.sh

# XXX shouldn't have to repeat the dir path
yarn ava 43:upgrade-11/post.test.js
