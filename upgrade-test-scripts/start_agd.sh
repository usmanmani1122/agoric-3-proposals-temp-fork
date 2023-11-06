#!/bin/bash
# Start and leave agd running

grep -qF 'env_setup.sh' /root/.bashrc || echo "source /usr/src/upgrade-test-scripts/env_setup.sh" >>/root/.bashrc
grep -qF 'printKeys' /root/.bashrc || echo "printKeys" >>/root/.bashrc

source ./env_setup.sh

export SLOGFILE=slog.slog

startAgd
