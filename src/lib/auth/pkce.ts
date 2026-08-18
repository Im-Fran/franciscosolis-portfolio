/** PKCE (RFC 7636) helpers built on WebCrypto — the auth service only accepts the S256 method. */

const base64Url = (bytes: ArrayBuffer | Uint8Array) => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** Cryptographically random, URL-safe string used for both the verifier and the state. */
export const randomToken = (bytes = 32) => base64Url(crypto.getRandomValues(new Uint8Array(bytes)));

export const challengeFor = async (verifier: string) =>
  base64Url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
