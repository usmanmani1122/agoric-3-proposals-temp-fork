#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { buildProposalSubmissions, buildTestImages } from './src/cli/build.js';
import { refreshDockerfile } from './src/cli/dockerfileGen.js';
import { matchOneProposal, readProposals } from './src/cli/proposals.js';
import { debugTestImage, runTestImages } from './src/cli/run.js';

const { positionals, values } = parseArgs({
  options: {
    match: { short: 'm', type: 'string' },
    dry: { type: 'boolean' },
    debug: { type: 'boolean' },
  },
  allowPositionals: true,
});

const allProposals = readProposals(path.resolve('.'));

const { match } = values;
const proposals = match
  ? allProposals.filter(p => p.proposalName.includes(match))
  : allProposals;

const [cmd] = positionals;

// TODO consider a lib like Commander for auto-gen help
const usage = `USAGE:
build

test [--debug]
`;

switch (cmd) {
  case 'build':
    execSync(
      // XXX very brittle
      'cp -r node_modules/@agoric/synthetic-chain/upgrade-test-scripts .',
    );
    refreshDockerfile(allProposals);
    buildProposalSubmissions(proposals);
    buildTestImages(proposals, values.dry);
    break;
  case 'test':
    if (values.debug) {
      debugTestImage(matchOneProposal(proposals, match!));
    } else {
      runTestImages(proposals);
    }
    break;
  default:
    console.log(usage);
}
