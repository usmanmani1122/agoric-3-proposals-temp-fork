#!/usr/bin/env tsx
// @ts-check

import fs from 'node:fs';
import { ProposalInfo, readProposals } from './common';

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
    { planName, sdkVersion, proposalName }: ProposalInfo,
    lastProposal: ProposalInfo,
  ) {
    if (!planName) {
      return `
# PREPARE ${proposalName}
# no-upgrade, just persist the state
FROM ghcr.io/agoric/agoric-sdk:${lastProposal.sdkVersion} as prepare-${proposalName}
WORKDIR /usr/src/agoric-sdk/
COPY --from=use-${lastProposal.proposalName} /root/.agoric /root/.agoric
`;
    }
    return `
# PREPARE ${proposalName}
# upgrading to ${planName}
FROM ghcr.io/agoric/agoric-sdk:${lastProposal.sdkVersion} as prepare-${proposalName}
ENV UPGRADE_TO=${planName}
WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-${lastProposal.proposalName} /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
`;
  },
  EXECUTE({ proposalName, planName, sdkVersion }: ProposalInfo) {
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
  USE({ proposalName, proposalIdentifier, planName }: ProposalInfo) {
    return `
# USE ${proposalName}
FROM execute-${proposalName} as use-${proposalName}

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

  // handle the first proposal specially
  if (previousProposal) {
    blocks.push(stage.PREPARE(proposal, previousProposal));
  } else {
    if (!proposal.planName) {
      throw new Error('first proposal must have a planName');
    }
    blocks.push(stage.START(proposal.proposalName, proposal.planName));
  }
  blocks.push(stage.EXECUTE(proposal));
  blocks.push(stage.USE(proposal));
  blocks.push(stage.TEST(proposal));
  previousProposal = proposal;
}

const contents = blocks.join('\n');
fs.writeFileSync('Dockerfile', contents);
