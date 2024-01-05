# Synthetic chain tools

Utilities to build a synthetic chain and test running proposals atop it. The chain approximates agoric-3 (Mainnet) using the state from https://github.com/Agoric/agoric-3-proposals (It could trivially support other Agoric chains, if we scale horizontally.)

## Design

Builds atop the `main` image of https://ghcr.io/agoric/agoric-3-proposals to execute proposals on top of the agoric-3 chain and also test them.

It also adopts the multi-stage Docker build flow from the a3p repo. See https://github.com/Agoric/agoric-3-proposals?tab=readme-ov-file#design

One deficiency in the current design is that share code in `upgrade-test-scripts` is not versioned or packaged. Any change to it will invalidate the base image. And each layer assumes it has the latest. And now with this repo, the local copy has to be kept in sync with the base image and the a3p repo.

```sh
node_modules/.bin/synthetic-chain build

node_modules/.bin/synthetic-chain test

node_modules/.bin/synthetic-chain test --debug -m <substring of proposal name>
```

shared JS is exported from the package.
non-JS is in `files` and can be untarred out for use in a3p

To depend on `@agoric/synthetic-chain` that isn't yet published, use `npm pack` in this package and copy the tgz into the proposal. Then use the `file:` protocol in the package.json to add it. Finally `yarn install` in the package to update local node_modules for linting. E.g.,

```json
    "dependencies": {
        "@agoric/synthetic-chain": "file:agoric-synthetic-chain-0.0.1-alpha.tgz",
```
