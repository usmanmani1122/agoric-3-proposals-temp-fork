#!/usr/bin/env tsx
// @ts-check

import { execSync } from 'child_process';
import { readProposals } from './common';

for (const proposal of readProposals()) {
  console.log(`Running test image for proposal ${proposal.proposalName}`);
  const target = `test-${proposal.proposalName}`;
  // 'rm' to remove the container when it exits
  const cmd = `docker run --rm ${target}`;
  // TODO stream the output
  execSync(cmd);
}
