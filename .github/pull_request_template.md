<!--
Thank you for submitting a pull request!

Please delete the sections below that aren pertinent to your PR
and then fulfill the remaining checklist items before merging.
-->

Closes #

# adopt a passed proposal
When a proposal passes on agoric-3 Mainnet, it should be included in the history that this synthetic image tracks.

- [ ] before this PR, change any `fromTag` using `latest` (such as [a3p-integration](https://github.com/Agoric/agoric-sdk/blob/master/a3p-integration/package.json)) to use a fixed version (otherwise they will fail when this PR changes latest and they pick it up)
- [ ] before merging this PR, include a link to a PR that restores `latest`
- [ ] after this PR merges, merge the other PRs so they're back on `latest`

## image building process

This should not affect other repos but be prepared that it might.

## @agoric/synthetic-chain library
These need to be published to be consumed in other apps. It's not yet on 1.0 so breaking changes are allowed, but please don't make them gratuitously.

- [ ] indicate in the PR description when you expect these to be published and by whom (it's currently a manual process)

## tooling improvements

As long as it passes CI it should be fine.

