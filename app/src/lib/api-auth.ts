import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./auth";

export function withAuth(
  handler: (req: NextRequest, payload: TokenPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const token = req.cookies.get("dentalsix-token")?.value;
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    return handler(req, payload);
  };
}
