import { CHAINID, agd } from '@agoric/synthetic-chain';

// submit a DeliverInbound transaction
//
// see {agoric.swingset.MsgDeliverInbound} in swingset/msgs.proto
// https://github.com/Agoric/agoric-sdk/blob/5cc5ec8836dcd0c6e11b10799966b6e74601295d/golang/cosmos/proto/agoric/swingset/msgs.proto#L23
export const submitDeliverInbound = async sender => {
  // ag-solo is a client that sends DeliverInbound transactions using a golang client
  // @see {connectToChain} in chain-cosmos-sdk.js
  // runHelper
  // https://github.com/Agoric/agoric-sdk/blob/5cc5ec8836dcd0c6e11b10799966b6e74601295d/packages/solo/src/chain-cosmos-sdk.js

  // The payload is JSON.stringify([messages, highestAck])
  // https://github.com/Agoric/agoric-sdk/blob/5cc5ec8836dcd0c6e11b10799966b6e74601295d/packages/solo/src/chain-cosmos-sdk.js#L625
  // for example, this json was captured from a running `agoric start local-solo`
  const json = `[[[1,"1:0:deliver:ro+1:rp-44;#[\\"getConfiguration\\",[]]"]],0]`;
  await agd.tx(
    'swingset',
    'deliver',
    `'${json}'`,
    `--chain-id="${CHAINID}"`,
    '--yes',
    `--from="${sender}"`,
    '--keyring-backend=test',
    '-b block',
  );
};
