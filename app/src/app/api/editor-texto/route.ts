import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const cd_tipo = url.searchParams.get("cd_tipo");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (cd_tipo) where.cd_tipo = cd_tipo;

  const modelos = await prisma.editorTexto.findMany({
    where,
    orderBy: { tx_titulo: "asc" },
  });

  return NextResponse.json({ modelos, total: modelos.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_titulo?.trim()) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  const modelo = await prisma.editorTexto.create({
    data: {
      tx_titulo: body.tx_titulo.trim(),
      tx_conteudo: body.tx_conteudo || null,
      cd_tipo: body.cd_tipo || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(modelo, { status: 201 });
}
