#!/usr/bin/env tsx
// @ts-check

import { execSync } from 'child_process';
import { readProposals } from './common';

for (const proposal of readProposals()) {
  console.log(`Building test image for proposal ${proposal.proposalName}`);
  const target = `test-${proposal.proposalName}`;
  const cmd = `docker build --tag ${target} --target ${target} .`;
  execSync(cmd);
}
