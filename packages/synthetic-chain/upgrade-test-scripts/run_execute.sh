#!/bin/bash
echo "Execute an upgrade"

source ./env_setup.sh

startAgd

echo "Run several blocks for the upgrade to settle, then exit"
waitForBlock 5
killAgd
