#!/usr/bin/env tsx
// @ts-check

import assert from 'node:assert';
import fs from 'node:fs';
import { readProposals } from './common';
import type {
  ProposalInfo,
  SoftwareUpgradeProposal,
  CoreEvalProposal,
} from './common';

const agZeroUpgrade = 'agoric-upgrade-7-2';

/**
 * Templates for Dockerfile stages
 */
const stage = {
  /**
   * ag0, start of the chain
   */
  START(proposalName: string, to: string) {
    return `
## START
# on ${agZeroUpgrade}, with upgrade to ${to}
FROM ghcr.io/agoric/ag0:${agZeroUpgrade} as prepare-${proposalName}
ENV UPGRADE_TO=${to} THIS_NAME=${agZeroUpgrade}
RUN mkdir -p /usr/src/agoric-sdk/upgrade-test-scripts
WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/start_ag0.sh ./upgrade-test-scripts/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/
# put env functions into shell environment
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc
SHELL ["/bin/bash", "-c"]
# this is the only layer that starts ag0
RUN . ./upgrade-test-scripts/start_ag0.sh
`;
  },
  /**
   * stage that only runs the upgrade handler
   */
  PREPARE(
    { planName, proposalName }: SoftwareUpgradeProposal,
    lastProposal: ProposalInfo,
  ) {
    return `
# PREPARE ${proposalName}
# upgrading to ${planName}
FROM use-${lastProposal.proposalName} as prepare-${proposalName}
ENV UPGRADE_TO=${planName}
WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
`;
  },
  /**
   * Execute a prepared upgrade
   */
  EXECUTE({ proposalName, planName, sdkVersion }: SoftwareUpgradeProposal) {
    return `
# EXECUTE ${proposalName}
FROM ghcr.io/agoric/agoric-sdk:${sdkVersion} as execute-${proposalName}
ENV THIS_NAME=${planName}

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY --from=prepare-${proposalName} /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
`;
  },
  /**
   * Run a core-eval proposal
   */
  EVAL(
    { proposalIdentifier, proposalName }: CoreEvalProposal,
    lastProposal: ProposalInfo,
  ) {
    return `
# EVAL ${proposalName}
FROM use-${lastProposal.proposalName} as eval-${proposalName}

COPY --chmod=755 ./proposals/${proposalIdentifier}:${proposalName}/* /usr/src/proposals/${proposalIdentifier}:${proposalName}/

WORKDIR /usr/src/upgrade-test-scripts/
RUN ./run_eval.sh ${proposalIdentifier}:${proposalName}
`;
  },
  USE({ proposalName, proposalIdentifier, type }: ProposalInfo) {
    const previousStage =
      type === 'Software Upgrade Proposal' ? 'execute' : 'eval';
    return `
# USE ${proposalName}
FROM ${previousStage}-${proposalName} as use-${proposalName}

COPY ./proposals/package.json /usr/src/proposals/
COPY --chmod=755 ./proposals/${proposalIdentifier}:${proposalName}/* /usr/src/proposals/${proposalIdentifier}:${proposalName}/

COPY --chmod=755 ./upgrade-test-scripts/*.* /usr/src/agoric-sdk/upgrade-test-scripts/
# XXX for JS module resolution
# TODO get this out of agoric-sdk path
COPY --chmod=755 ./upgrade-test-scripts/*.* /usr/src/upgrade-test-scripts/
# TODO remove network dependencies in stages
RUN cd /usr/src/upgrade-test-scripts/ && yarn install

WORKDIR /usr/src/agoric-sdk/upgrade-test-scripts/
RUN ./run_actions.sh ${proposalIdentifier}:${proposalName}
# no entrypoint; results of these actions are part of the image
SHELL ["/bin/bash", "-c"]
`;
  },
  TEST({ proposalName, proposalIdentifier }: ProposalInfo) {
    return `
# TEST ${proposalName}
FROM use-${proposalName} as test-${proposalName}

# XXX the test files were already copied in the "use" stage
# nothing to build, just an image for running tests
ENTRYPOINT ./run_tests.sh ${proposalIdentifier}:${proposalName}
`;
  },
};

// Each stage tests something about the left argument and prepare an upgrade to the right side (by passing the proposal and halting the chain.)
// The upgrade doesn't happen until the next stage begins executing.
const blocks: string[] = [];

let previousProposal: ProposalInfo | null = null;
for (const proposal of readProposals()) {
  //   UNTIL region support https://github.com/microsoft/vscode-docker/issues/230
  blocks.push(
    `#----------------\n# ${proposal.proposalName}\n#----------------`,
  );

  if (proposal.type === '/agoric.swingset.CoreEvalProposal') {
    blocks.push(stage.EVAL(proposal, previousProposal!));
  } else if (proposal.type === 'Software Upgrade Proposal') {
    // handle the first proposal specially
    if (previousProposal) {
      blocks.push(stage.PREPARE(proposal, previousProposal));
    } else {
      blocks.push(stage.START(proposal.proposalName, proposal.planName));
    }
    blocks.push(stage.EXECUTE(proposal));
  }

  blocks.push(stage.USE(proposal));
  blocks.push(stage.TEST(proposal));
  previousProposal = proposal;
}

const contents = blocks.join('\n');
fs.writeFileSync('Dockerfile', contents);
