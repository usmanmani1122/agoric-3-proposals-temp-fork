#!/usr/bin/env tsx
// @ts-check

import { execSync } from 'child_process';
import { imageNameForProposalTest, readProposals } from './common';

for (const proposal of readProposals()) {
  console.log(`\nBuilding test image for proposal ${proposal.proposalName}`);
  const { name, target } = imageNameForProposalTest(proposal);
  const cmd = `docker build --tag ${name} --target ${target} .`;
  console.log(cmd);
  execSync(cmd);
}
