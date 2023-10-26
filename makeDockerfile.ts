#!/usr/bin/env tsx
// @ts-check

import fs from 'node:fs';

/**
 * Templates for Dockerfile stages
 */
const stage = {
    /**
     * ag0, start of the chain
     */
    START(thisName: string, to: string) {
        return `
## START
# on ${thisName}, with upgrade to ${to}
FROM ghcr.io/agoric/ag0:${thisName} as ${thisName}
ENV UPGRADE_TO=${to} THIS_NAME=${thisName}
RUN mkdir -p /usr/src/agoric-sdk/upgrade-test-scripts
WORKDIR /usr/src/agoric-sdk/
COPY ./start_ag0.sh ./upgrade-test-scripts/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
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
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc
COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
`;
    },
    /**
     * stage that only runs the upgrade handler
     */
    UPGRADE(from: string, to: string, sdk_version: number) {
        return `
# UPGRADE
#this is ${from} upgrading to ${to}
FROM ghcr.io/agoric/agoric-sdk:${sdk_version} as propose-${to}
ENV THIS_NAME=propose-${to} UPGRADE_TO=${to}
WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
COPY --from=${from} /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh        
`;
    },
    /**
     * stage that only tests a previous upgrade
     */
    TEST(from: string, sdk_version: number) {
        return `
# TEST
FROM ghcr.io/agoric/agoric-sdk:${sdk_version} as ${from}
ENV THIS_NAME=${from} USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
COPY --from=propose-${from} /root/.agoric /root/.agoric
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
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./\${THIS_NAME} ./upgrade-test-scripts/\${THIS_NAME}/
SHELL ["/bin/bash", "-c"]
RUN chmod +x ./upgrade-test-scripts/*.sh
# enter image in interactive shell
ENTRYPOINT /usr/src/agoric-sdk/upgrade-test-scripts/start_to_to.sh
`;
    }}

// Each stage tests something about the left argument and prepare an upgrade to the right side (by passing the proposal and halting the chain.)
// The upgrade doesn't happen until the next stage begins executing.
const contents = [
    stage.START('agoric-upgrade-7-2', 'agoric-upgrade-8'),
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
    stage.UPGRADE('agoric-upgrade-10', 'agoric-upgrade-11', 35),
    stage.TEST('agoric-upgrade-11', 36),
    stage.UPGRADE('agoric-upgrade-11', 'agoric-upgrade-12', 36),
    stage.FINAL('agoric-upgrade-12'),
].join('#---------------------------------------------------\n');

fs.writeFileSync('Dockerfile', contents);
