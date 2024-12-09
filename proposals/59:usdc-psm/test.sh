#!/bin/bash
set -euo pipefail
echo check for USDC in psm pairs
agd query vstorage children published.psm.IST | grep USDC
