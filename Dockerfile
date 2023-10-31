#----------------
# upgrade-8
#----------------

## START
# on agoric-upgrade-7-2, with upgrade to agoric-upgrade-8
FROM ghcr.io/agoric/ag0:agoric-upgrade-7-2 as prepare-upgrade-8
ENV UPGRADE_TO=agoric-upgrade-8 THIS_NAME=agoric-upgrade-7-2
RUN mkdir -p /usr/src/agoric-sdk/upgrade-test-scripts
WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/start_ag0.sh ./upgrade-test-scripts/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/
# put env functions into shell environment
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc
SHELL ["/bin/bash", "-c"]
# this is the only layer that starts ag0
RUN . ./upgrade-test-scripts/start_ag0.sh


# EXECUTE upgrade-8
FROM ghcr.io/agoric/agoric-sdk:29 as execute-upgrade-8
ENV THIS_NAME=agoric-upgrade-8

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-8 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh


# USE upgrade-8
FROM execute-upgrade-8 as use-upgrade-8
ENV THIS_NAME=agoric-upgrade-8

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/run_actions.sh ./proposals/16:upgrade-8/actions.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]

WORKDIR /usr/src/agoric-sdk/upgrade-test-scripts/
ENTRYPOINT ./run_actions.sh

#----------------
# upgrade-9
#----------------

# PREPARE upgrade-9
# upgrading to agoric-upgrade-9
FROM ghcr.io/agoric/agoric-sdk:29 as prepare-upgrade-9
ENV UPGRADE_TO=agoric-upgrade-9
WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-upgrade-8 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh


# EXECUTE upgrade-9
FROM ghcr.io/agoric/agoric-sdk:31 as execute-upgrade-9
ENV THIS_NAME=agoric-upgrade-9

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-9 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh


# USE upgrade-9
FROM execute-upgrade-9 as use-upgrade-9
ENV THIS_NAME=agoric-upgrade-9

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/run_actions.sh ./proposals/29:upgrade-9/actions.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]

WORKDIR /usr/src/agoric-sdk/upgrade-test-scripts/
ENTRYPOINT ./run_actions.sh

#----------------
# upgrade-10
#----------------

# PREPARE upgrade-10
# upgrading to agoric-upgrade-10
FROM ghcr.io/agoric/agoric-sdk:31 as prepare-upgrade-10
ENV UPGRADE_TO=agoric-upgrade-10
WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-upgrade-9 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh


# EXECUTE upgrade-10
FROM ghcr.io/agoric/agoric-sdk:35 as execute-upgrade-10
ENV THIS_NAME=agoric-upgrade-10

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-10 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh


# USE upgrade-10
FROM execute-upgrade-10 as use-upgrade-10
ENV THIS_NAME=agoric-upgrade-10

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/run_actions.sh ./proposals/34:upgrade-10/actions.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]

WORKDIR /usr/src/agoric-sdk/upgrade-test-scripts/
ENTRYPOINT ./run_actions.sh

#----------------
# upgrade-11
#----------------

# PREPARE upgrade-11
# upgrading to agoric-upgrade-11
FROM ghcr.io/agoric/agoric-sdk:35 as prepare-upgrade-11
ENV UPGRADE_TO=agoric-upgrade-11
WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY --from=use-upgrade-10 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh


# EXECUTE upgrade-11
FROM ghcr.io/agoric/agoric-sdk:36 as execute-upgrade-11
ENV THIS_NAME=agoric-upgrade-11

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/start_to_to.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=prepare-upgrade-11 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh


# USE upgrade-11
FROM execute-upgrade-11 as use-upgrade-11
ENV THIS_NAME=agoric-upgrade-11

WORKDIR /usr/src/agoric-sdk/
COPY ./upgrade-test-scripts/env_setup.sh ./upgrade-test-scripts/run_actions.sh ./proposals/43:upgrade-11/actions.sh ./upgrade-test-scripts/

COPY ./upgrade-test-scripts/${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]

WORKDIR /usr/src/agoric-sdk/upgrade-test-scripts/
ENTRYPOINT ./run_actions.sh
