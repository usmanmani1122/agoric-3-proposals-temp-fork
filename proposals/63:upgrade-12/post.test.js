import test from 'ava';

import { agd } from '../../upgrade-test-scripts/lib/cliHelper.js';

test('Ensure MaxBytes param was updated', async t => {
  const { value: rawParams } = await agd.query(
    'params',
    'subspace',
    'baseapp',
    'BlockParams',
  );
  const blockParams = JSON.parse(rawParams);
  t.is(blockParams.max_bytes, '5242880');
});
