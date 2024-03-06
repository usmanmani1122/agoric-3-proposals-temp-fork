import { NonNullish } from './assert.js';

export const GOV1ADDR = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
export const GOV2ADDR = 'agoric1wrfh296eu2z34p6pah7q04jjuyj3mxu9v98277';
export const GOV3ADDR = 'agoric1ydzxwh6f893jvpaslmaz6l8j2ulup9a7x8qvvq';
export const USER1ADDR = 'agoric1rwwley550k9mmk6uq6mm6z4udrg8kyuyvfszjk';
export const VALIDATORADDR = 'agoric1estsewt6jqsx77pwcxkn5ah0jqgu8rhgflwfdl';

export const BINARY = NonNullish(process.env.binary);

export const PSM_PAIR = NonNullish(process.env.PSM_PAIR);
export const ATOM_DENOM = NonNullish(process.env.ATOM_DENOM);

export const CHAINID = NonNullish(process.env.CHAINID);
export const HOME = NonNullish(process.env.HOME);

export const SDK_ROOT = '/usr/src/agoric-sdk';
