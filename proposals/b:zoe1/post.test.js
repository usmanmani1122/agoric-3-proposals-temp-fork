import test from 'ava';
import { getIncarnation } from '../../upgrade-test-scripts/lib/vat-status.js';

test(`Zoe vat was upgraded`, async t => {
  const incarantion = await getIncarnation('zoe');
  t.is(incarantion, 1);
});
