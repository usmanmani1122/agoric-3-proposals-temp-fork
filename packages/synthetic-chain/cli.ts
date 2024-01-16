#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  buildProposalSubmissions,
  buildProposalImages,
  readBuildConfig,
} from './src/cli/build.js';
import { writeDockerfile } from './src/cli/dockerfileGen.js';
import { matchOneProposal, readProposals } from './src/cli/proposals.js';
import { debugTestImage, runTestImages } from './src/cli/run.js';
import { runDoctor } from './src/cli/doctor.js';

const { positionals, values } = parseArgs({
  options: {
    match: { short: 'm', type: 'string' },
    dry: { type: 'boolean' },
    debug: { type: 'boolean' },
  },
  allowPositionals: true,
});

const root = path.resolve('.');
const buildConfig = readBuildConfig(root);
const allProposals = readProposals(root);

const { match } = values;
const proposals = match
  ? allProposals.filter(p => p.proposalName.includes(match))
  : allProposals;

const [cmd] = positionals;

// TODO consider a lib like Commander for auto-gen help
const usage = `USAGE:
build           - build the synthetic-chain "use" images

test [--debug]  - build the "test" images and run them

doctor          - diagnostics and quick fixes
`;

const buildUseImages = () => {
  execSync(
    // XXX very brittle
    'cp -r node_modules/@agoric/synthetic-chain/upgrade-test-scripts .',
  );
  buildProposalSubmissions(proposals);
  buildProposalImages(proposals, 'use', values.dry);
};

switch (cmd) {
  case 'build': {
    const { fromTag } = buildConfig;
    writeDockerfile(allProposals, fromTag);
    buildUseImages();
    break;
  }
  case 'test':
    // always rebuild all test images. Keeps it simple and these are fast
    // as long as the "use" stages are cached because they don't execute anything themselves.
    buildProposalImages(proposals, 'test', values.dry);
    if (values.debug) {
      debugTestImage(matchOneProposal(proposals, match!));
    } else {
      runTestImages(proposals);
    }
    break;
  case 'doctor':
    runDoctor(allProposals);
    break;
  default:
    console.log(usage);
}
