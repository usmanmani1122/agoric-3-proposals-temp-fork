# Keys for testing only

These keys were made separately from the build to store in SCM. That way they are consistent for all testing.

Previously we made them fresh with each build of the first stage, to ensure that application code would never be hard-coded to depend on certain keys.

The downside was that tests had to read the files from the Docker image and those were not available to GUIs like the Keplr wallet.

So as of https://github.com/Agoric/agoric-3-proposals/issues/5 we store the keys in SCM, in this directory that is conspicuous for testing only.
