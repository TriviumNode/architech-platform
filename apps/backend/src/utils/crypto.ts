import { Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { PubKey } from '@tendermint/sig';
import { bech32 } from 'bech32';
import { createHash } from 'crypto';

// export const pubKeyToAddress = (publicKeyBase64: string) => {
//     const publicKey = Buffer.from(publicKeyBase64, 'base64')
//     console.log(`public key: ${publicKey}`);
//     const sha256 = createHash('sha256');
//     const ripemd = createHash('ripemd160');
//     sha256.update(publicKey);
//     ripemd.update(sha256.digest());
//     const rawAddr = ripemd.digest();
//     const cosmosAddress = bech32.encode('cosmos', bech32.toWords(rawAddr));
//     return {address: cosmosAddress, pub_key: JSON.parse};
// }

export const validateAddress = (address: string, pubKey: PubKey) => {
  // Validate address against pubkey
  const addrFromPub = pubkeyToAddress(pubKey, process.env.PREFIX);
  return address === addrFromPub;
};
