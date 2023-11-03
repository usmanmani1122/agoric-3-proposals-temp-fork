#!/bin/bash

# Exit when any command fails
set -e

source /usr/src/upgrade-test-scripts/env_setup.sh

# NOTE: agoric follow doesn't have the `--first-value-only` parameter in this version
# so we use a hack

# save somewhere we can access later
echo "Dumping PSM gov params..."
timeout 3 agoric follow -l :published.psm.${PSM_PAIR}.metrics -o jsonlines | tee /root/.agoric/psm_metrics.json
timeout 3 agoric follow -l :published.psm.${PSM_PAIR}.governance -o jsonlines | tee /root/.agoric/psm_governance.json

test_not_val "$(cat /root/.agoric/psm_metrics.json | wc -l)" "0" "psm metrics shouldnt be empty"
test_not_val "$(cat /root/.agoric/psm_governance.json | wc -l)" "0" "psm gov params shouldnt be empty"
