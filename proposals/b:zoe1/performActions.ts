#!/usr/bin/env tsx

import { evalBundles } from '@agoric/synthetic-chain/src/lib/core-eval';

// TODO infer this from package.json

await evalBundles('submission');
