import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dentalsix-dev-secret-change-me";

export interface TokenPayload {
  id_usuario: number;
  id_conta: number;
  tx_nome: string;
  tx_email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
