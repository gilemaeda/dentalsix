import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const perfis = await prisma.perfil.findMany({
    where: { id_conta: payload.id_conta, fl_ativo: true },
    orderBy: { tx_nome: "asc" },
  });

  return NextResponse.json({ perfis, total: perfis.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const perfil = await prisma.perfil.create({
    data: {
      tx_nome: body.tx_nome.trim(),
      tx_descricao: body.tx_descricao || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(perfil, { status: 201 });
}
