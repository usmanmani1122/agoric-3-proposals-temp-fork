#!/bin/bash
source /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh

# XXX shouldn't have to repeat the dir path
yarn ava 34:upgrade-10/post.test.js
