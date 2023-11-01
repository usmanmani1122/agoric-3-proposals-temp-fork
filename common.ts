#!/usr/bin/env tsx
// @ts-check

import fs from 'node:fs';
import * as path from 'node:path';

export type ProposalInfo = {
  sdkVersion: string;
  planName?: string;
  proposalName: string;
  proposalIdentifier: string;
};

function readInfo(proposalPath: string): ProposalInfo {
  const configPath = path.join('proposals', proposalPath, 'config.json');
  const config = fs.readFileSync(configPath, 'utf-8');
  const [proposalIdentifier, proposalName] = proposalPath.split(':');
  return {
    ...JSON.parse(config),
    proposalIdentifier,
    proposalName,
  };
}

export function readProposals() {
  const proposalPaths = fs
    .readdirSync('./proposals', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory()) // omit files
    .map(dirent => dirent.name)
    .filter(name => name.includes(':')); // omit node_modules
  return proposalPaths.map(readInfo);
}
