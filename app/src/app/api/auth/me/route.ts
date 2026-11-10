import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  return NextResponse.json({
    tx_nome: payload.tx_nome,
    tx_email: payload.tx_email,
    id_usuario: payload.id_usuario,
    id_conta: payload.id_conta,
    conta_nome: "GAPO Odontologia",
    ultimo_acesso: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
  });
}
