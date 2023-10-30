
## START
# on agoric-upgrade-7-2, with upgrade to agoric-upgrade-8
FROM ghcr.io/agoric/ag0:agoric-upgrade-7-2 as prepare-upgrade-8
ENV UPGRADE_TO=agoric-upgrade-8 THIS_NAME=agoric-upgrade-7-2
RUN mkdir -p /usr/src/agoric-sdk/upgrade-test-scripts
WORKDIR /usr/src/agoric-sdk/
COPY ./start_ag0.sh ./upgrade-test-scripts/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
# put env functions into shell environment
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc
SHELL ["/bin/bash", "-c"]
# this is the only layer that starts ag0
RUN . ./upgrade-test-scripts/start_ag0.sh
#---------------------------------------------------

# USE upgrade-8
FROM ghcr.io/agoric/agoric-sdk:29 as use-upgrade-8
ENV THIS_NAME=agoric-upgrade-8 USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-8 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh 
#---------------------------------------------------

# PREPARE upgrade-9
# upgrading to agoric-upgrade-9
FROM ghcr.io/agoric/agoric-sdk:29 as prepare-upgrade-9
ENV UPGRADE_TO=agoric-upgrade-9
WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-upgrade-8 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
#---------------------------------------------------

# USE upgrade-9
FROM ghcr.io/agoric/agoric-sdk:31 as use-upgrade-9
ENV THIS_NAME=agoric-upgrade-9 USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-9 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh 
#---------------------------------------------------

# PREPARE upgrade-10
# upgrading to agoric-upgrade-10
FROM ghcr.io/agoric/agoric-sdk:31 as prepare-upgrade-10
ENV UPGRADE_TO=agoric-upgrade-10
WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-upgrade-9 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
#---------------------------------------------------

# USE upgrade-10
FROM ghcr.io/agoric/agoric-sdk:35 as use-upgrade-10
ENV THIS_NAME=agoric-upgrade-10 USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-10 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh 
#---------------------------------------------------

# PREPARE upgrade-11
# upgrading to agoric-upgrade-11
FROM ghcr.io/agoric/agoric-sdk:35 as prepare-upgrade-11
ENV UPGRADE_TO=agoric-upgrade-11
WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-upgrade-10 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh
#---------------------------------------------------

# USE upgrade-11
FROM ghcr.io/agoric/agoric-sdk:36 as use-upgrade-11
ENV THIS_NAME=agoric-upgrade-11 USE_JS=1

WORKDIR /usr/src/agoric-sdk/
COPY ./env_setup.sh ./start_to_to.sh ./package.json ./*.js ./upgrade-test-scripts/

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-11 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh 
