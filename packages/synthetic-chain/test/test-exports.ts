import test from 'ava';

import * as lib from '../src/lib/index.js';

test('exports', t => {
  t.snapshot(lib);
});
