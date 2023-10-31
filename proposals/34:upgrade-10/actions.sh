#!/bin/bash

source ./env_setup.sh

yarn ava --serial agoric-upgrade*/**/pre.test.js agoric-upgrade*/**/actions.test.js

./legacy.sh
