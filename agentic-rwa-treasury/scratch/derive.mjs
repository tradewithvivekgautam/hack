import { Hex } from 'ox';
import { privateKeyToAddress } from 'viem/accounts';

const bytes = new Uint8Array([ 90, 82, 16, 200, 33, 88, 38, 149, 133, 146, 110, 246, 228, 50, 45, 126, 14, 240, 158, 104, 105, 179, 192, 186, 227, 205, 254, 165, 55, 176, 227, 89 ]);
const hexKey = Hex.fromBytes(bytes);
const addr = privateKeyToAddress(hexKey);

console.log("HEX_KEY:", hexKey);
console.log("MATCHED_ADDRESS:", addr);
