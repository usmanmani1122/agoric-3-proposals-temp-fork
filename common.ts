#!/usr/bin/env tsx
// @ts-check

import assert from 'node:assert';
import fs from 'node:fs';
import * as path from 'node:path';

export const repository = 'ghcr.io/agoric/agoric-3-proposals';

type ProposalCommon = {
  proposalName: string;
  proposalIdentifier: string;
};

export type SoftwareUpgradeProposal = ProposalCommon & {
  sdkImageTag: string;
  planName: string;
  releaseNodes: string;
  type: 'Software Upgrade Proposal';
};

export type CoreEvalProposal = ProposalCommon & {
  type: '/agoric.swingset.CoreEvalProposal';
};

export type ProposalInfo = SoftwareUpgradeProposal | CoreEvalProposal;

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

export function readProposals(): ProposalInfo[] {
  const proposalPaths = fs
    .readdirSync('./proposals', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory()) // omit files
    .map(dirent => dirent.name)
    .filter(name => name.includes(':')); // omit node_modules
  return proposalPaths.map(readInfo);
}

export function lastPassedProposal(proposals: ProposalInfo[]): ProposalInfo {
  // @ts-expect-error use es2023; findLast is available in Node 18
  const last = proposals.findLast(p => p.proposalIdentifier.match(/^\d/));
  assert(last, 'no passed proposals');
  return last;
}

export function imageNameForProposalTest(proposal) {
  const target = `test-${proposal.proposalName}`;
  return {
    name: `${repository}:${target}`,
    target,
  };
}
