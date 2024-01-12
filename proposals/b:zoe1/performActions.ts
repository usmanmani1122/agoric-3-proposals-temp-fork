#!/usr/bin/env tsx

import { passCoreEvalProposal } from '@agoric/synthetic-chain/src/lib/core-eval';
import { readSubmissions } from '@agoric/synthetic-chain/src/lib/core-eval-support.js';

// TODO infer this from package.json
/**
 * URLs of assets, including bundle hashes (to be) agreed by BLD stakers
 */
const assetInfo = {
  repo: {
    name: 'zoe1',
    description: 'first upgrade of Zoe vat',
  },
  buildAssets: await readSubmissions(),
};

const staticConfig = {
  deposit: '10000000ubld', // 10 BLD
  installer: 'gov1', // as in: agd keys show gov1
  proposer: 'validator',
  collateralPrice: 6, // conservatively low price. TODO: look up
  swingstorePath: '~/.agoric/data/agoric/swingstore.sqlite',
  title: assetInfo.repo.name,
  description: assetInfo.repo.description,
  buildInfo: Object.values(assetInfo.buildAssets),
};

await passCoreEvalProposal(staticConfig);
