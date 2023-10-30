#!/usr/bin/env tsx
// @ts-check

import fs from 'node:fs';
import * as path from 'node:path';

const agZeroUpgrade = 'agoric-upgrade-7-2';

type ProposalInfo = {
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
COPY ./start_ag0.sh ./upgrade-test-scripts/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
# put env functions into shell environment
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc
SHELL ["/bin/bash", "-c"]
# this is the only layer that starts ag0
RUN . ./upgrade-test-scripts/start_ag0.sh
`;
  },
  /**
   * legacy layer type in which the chain upgrade and its tests are comingled
   */
  UPGRADE_AND_TEST(from: string, thisName: string, sdk_version: number) {
    return `
## UPGRADE_AND_TEST
FROM ghcr.io/agoric/agoric-sdk:${sdk_version} as ${thisName}
ENV THIS_NAME=${thisName}
# copy from previous build
COPY --from=${from} /root/.agoric /root/.agoric

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
`;
  },
  /**
   * JS variant of legacy layer type in which the chain upgrade and its tests are comingled
   */
  UPGRADE_AND_TEST_JS(from: string, to: string, sdk_version: number) {
    return `
## UPGRADE_AND_TEST
FROM ghcr.io/agoric/agoric-sdk:${sdk_version} as ${to}
ENV THIS_NAME=${to} USE_JS=1
# copy from previous build
COPY --from=${from} /root/.agoric /root/.agoric

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
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
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-${lastProposal.proposalName} /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
`;
  },
  /**
   * stage that only tests a previous upgrade
   */
  TEST(current: string, sdk_version: number) {
    return `
# TEST
FROM ghcr.io/agoric/agoric-sdk:${sdk_version} as ${current}
ENV THIS_NAME=${current} USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install

COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
COPY --from=propose-${current} /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh 
`;
  },
  /**
   * stage that only tests a previous upgrade
   */
  USE({ proposalName, planName, sdkVersion }: ProposalInfo) {
    return `
# USE ${proposalName}
FROM ghcr.io/agoric/agoric-sdk:${sdkVersion} as use-${proposalName}
ENV THIS_NAME=${planName} USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/

COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
COPY --from=prepare-${proposalName} /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh 
`;
  },
  /**
   * the final stage for the image this build is producing, running the chain
   */
  FINAL(from: string) {
    return `
# FINAL
FROM ghcr.io/agoric/agoric-sdk:dev as ${from}
ENV THIS_NAME=${from} USE_JS=1
COPY --from=propose-${from} /root/.agoric /root/.agoric

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install

COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
SHELL ["/bin/bash", "-c"]
RUN chmod +x ./upgrade-test-scripts/*.sh
# enter image in interactive shell
ENTRYPOINT /usr/src/agoric-sdk/upgrade-test-scripts/start_to_to.sh
`;
  },
};

const proposalPaths = fs.readdirSync('./proposals');

// Each stage tests something about the left argument and prepare an upgrade to the right side (by passing the proposal and halting the chain.)
// The upgrade doesn't happen until the next stage begins executing.
const blocks: string[] = [];

let previousProposal: ProposalInfo | null = null;
for (const path of proposalPaths) {
  const proposal = readInfo(path);
  // handle the first proposal specially
  if (!previousProposal) {
    if (!proposal.planName) {
      throw new Error('first proposal must have a planName');
    }
    blocks.push(stage.START(proposal.proposalName, proposal.planName));
    blocks.push(stage.USE(proposal));
    previousProposal = proposal;
    continue;
  }

  blocks.push(stage.PREPARE(proposal, previousProposal));
  blocks.push(stage.USE(proposal));

  previousProposal = proposal;
}

/*
    // to 16-upgrade-8
    stage.UPGRADE_AND_TEST('agoric-upgrade-7-2', 'agoric-upgrade-8', 29),
    // old Dockerfile had upgrade-8-1, but it was empty and doesn't make any sense to me
    // to 28-upgrade-9
    stage.UPGRADE_AND_TEST('agoric-upgrade-8', 'agoric-upgrade-9', 30),
    // to 34-upgrade-10
    stage.UPGRADE_AND_TEST('agoric-upgrade-9', 'agoric-upgrade-10', 31),
    // XXX idiosynchratic stage
`
#this is agoric-upgrade-10 / vaults
FROM ghcr.io/agoric/agoric-sdk:35 as agoric-upgrade-10
ENV THIS_NAME=agoric-upgrade-10 USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
COPY --from=agoric-upgrade-9 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
`,
    // 043-upgrade-11
    stage.PREPARE('agoric-upgrade-10', 'agoric-upgrade-11', 35),
    stage.TEST('agoric-upgrade-11', 36),
    stage.PREPARE('agoric-upgrade-11', 'agoric-upgrade-12', 36),
    stage.FINAL('agoric-upgrade-12'),
].join('#---------------------------------------------------\n');
*/

const contents = blocks.join(
  '#---------------------------------------------------\n',
);
fs.writeFileSync('Dockerfile', contents);
