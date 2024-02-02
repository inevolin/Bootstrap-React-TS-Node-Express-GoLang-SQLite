import * as JWT from "jsonwebtoken";
import crypto from "crypto";

type claimValue = string | number | null;
export interface Jwt {
  id: string;
  iat: number;
  iss: string;
  sub: string;
  type: string[];
  claims: { [key: string]: claimValue };
}

export interface Cert {
  encoded: string;
  decoded: Jwt;
}

export interface KeyPair {
  publicKeyPEM: string;
  privateKeyPEM: string;
}

export async function createKeyPair(): Promise<KeyPair> {
  const kp = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1", // prime256v1 = secp256r1 = P-256
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  const publicKeyPEM = kp.publicKey.toString();
  const privateKeyPEM = kp.privateKey.toString();
  return { publicKeyPEM, privateKeyPEM };
}

export async function createVC(input: {
  privateKeyPEM: string;
  toDID: string;
  id: string;
  type: string[];
  claims: { [key: string]: claimValue };
}): Promise<Cert> {
  const { privateKeyPEM, toDID, id, type, claims } = input;

  const cred: Jwt = {
    id,
    iss: "server",
    sub: toDID,
    iat: Math.floor(new Date().getTime() / 1000),
    claims,
    type,
  };

  const jwt = JWT.sign(cred, privateKeyPEM, { algorithm: "ES256" });
  return {
    encoded: jwt,
    decoded: cred,
  };
}

export async function verifyVC(
  vc: string,
  publicKeyPEM: string
): Promise<{ verified: boolean; jwt?: Jwt }> {
  try {
    const jwt = JWT.verify(vc, publicKeyPEM, { algorithms: ["ES256"] });
    if (!jwt?.sub) throw new Error("missing jwt");
    return { verified: true, jwt: jwt as Jwt };
  } catch (e) {
    return { verified: false };
  }
}
