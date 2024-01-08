#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { buildProposalSubmissions, buildTestImages } from './src/cli/build.js';
import { writeDockerfile } from './src/cli/dockerfileGen.js';
import { matchOneProposal, readProposals } from './src/cli/proposals.js';
import { debugTestImage, runTestImages } from './src/cli/run.js';

// Tag of the agoric-3 image containing all passed proposals
const baseTag = 'main';

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
append [<tag>]  - build on top of an existing image (defaults to latest from a3p)

rebuild         - build from the beginning

test [--debug]  - run the tests of the proposals
`;

const buildImages = () => {
  execSync(
    // XXX very brittle
    'cp -r node_modules/@agoric/synthetic-chain/upgrade-test-scripts .',
  );
  buildProposalSubmissions(proposals);
  buildTestImages(proposals, values.dry);
};

switch (cmd) {
  case 'amend': // alias for backcompat
  case 'append':
    const fromTag = positionals[1] || baseTag;
    writeDockerfile(allProposals, fromTag);
    buildImages();
    break;
  case 'build': // alias for backcompat
  case 'rebuild':
    writeDockerfile(allProposals);
    buildImages();
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
