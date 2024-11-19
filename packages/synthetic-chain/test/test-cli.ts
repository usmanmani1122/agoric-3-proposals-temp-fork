import test from 'ava';
import {
  type ProposalInfo,
  compareProposalDirNames,
  imageNameForProposal,
} from '../src/cli/proposals.js';

test('compareProposalDirNames', t => {
  const inputs = [
    '1:first',
    '9:second',
    '10:third',
    '99:fourth',
    '100:fifth',
    'foo:a',
    'bar:b',
    'baz:c',
    '.dot:d',
    'Z:e',
    'qux',
    'quux',
  ].sort();
  t.deepEqual(inputs.slice().sort(compareProposalDirNames), [
    // by numeric position
    '1:first',
    '9:second',
    '10:third',
    '99:fourth',
    '100:fifth',
    // lexicographically by whatever precedes the first colon
    '.dot:d',
    'Z:e',
    'bar:b',
    'baz:c',
    'foo:a',
    // lexicographically by full name
    'quux',
    'qux',
  ]);
});

test('imageNameForProposal', t => {
  const proposal: ProposalInfo = {
    type: '/agoric.swingset.CoreEvalProposal',
    path: '1:foo',
    proposalName: 'foo',
    proposalIdentifier: 'z',
    source: 'build',
    buildScript: 'n/a',
  };
  t.deepEqual(imageNameForProposal(proposal, 'test'), {
    name: 'ghcr.io/agoric/agoric-3-proposals:test-foo',
    target: 'test-foo',
  });
});
