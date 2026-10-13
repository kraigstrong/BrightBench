import { X509Certificate, verify } from 'node:crypto';
import type { Identity } from './apex-laps.ts';

// Game Center identity verification: the app signs in to Game Center and asks it for a signature over who the player
// is; Apple's certificate proves Game Center made it. See GKLocalPlayer.fetchItems(forIdentityVerificationSignature:).

export type FetchCertificate = (url: URL) => Promise<Buffer>;

/** How old (or how far in the future) a signature may be. */
export const maxSignatureAgeMs = 15 * 60 * 1000;

/** What Game Center signs: team player ID and bundle ID (UTF-8), timestamp (big-endian UInt64), then the salt. */
export function signedPayload(playerID: string, bundleID: string, timestamp: number, salt: Buffer) {
  const time = Buffer.alloc(8);
  time.writeBigUInt64BE(BigInt(timestamp));
  return Buffer.concat([Buffer.from(playerID, 'utf8'), Buffer.from(bundleID, 'utf8'), time, salt]);
}

const certificates = new Map<string, Promise<Buffer>>();
/** Fetches Apple's certificate over HTTPS (that TLS connection to apple.com is the trust anchor), cached per URL. */
export const fetchAppleCertificate: FetchCertificate = url => {
  const key = url.toString();
  let pending = certificates.get(key);
  if (!pending) {
    pending = fetch(url, {redirect: 'error'}).then(async response => {
      if (!response.ok) throw new Error('certificate unavailable');
      return Buffer.from(await response.arrayBuffer());
    });
    pending.catch(() => certificates.delete(key));
    certificates.set(key, pending);
  }
  return pending;
};

export async function verifyGameCenterIdentity(identity: Identity, playerID: string, bundleID: string,
  deps: { fetchCertificate?: FetchCertificate; now?: () => number } = {}): Promise<boolean> {
  let url: URL;
  try { url = new URL(identity.publicKeyURL); } catch { return false; }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.apple.com')) return false;
  const now = deps.now?.() ?? Date.now();
  if (Math.abs(now - identity.timestamp) > maxSignatureAgeMs) return false;
  try {
    const certificate = new X509Certificate(await (deps.fetchCertificate ?? fetchAppleCertificate)(url));
    if (now < Date.parse(certificate.validFrom) || now > Date.parse(certificate.validTo)) return false;
    const payload = signedPayload(playerID, bundleID, identity.timestamp, Buffer.from(identity.salt, 'base64'));
    return verify('sha256', payload, certificate.publicKey, Buffer.from(identity.signature, 'base64'));
  } catch { return false; }
}
