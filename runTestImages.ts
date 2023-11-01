#!/usr/bin/env tsx
// @ts-check

import { execSync } from 'child_process';
import { imageNameForProposalTest, readProposals } from './common';

for (const proposal of readProposals()) {
  console.log(`Running test image for proposal ${proposal.proposalName}`);
  const { name } = imageNameForProposalTest(proposal);
  // 'rm' to remove the container when it exits
  const cmd = `docker run --rm ${name}`;
  // TODO stream the output
  execSync(cmd);
}
