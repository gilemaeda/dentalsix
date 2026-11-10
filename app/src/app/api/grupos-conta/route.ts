import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const busca = url.searchParams.get("busca") || "";

  const where = {
    id_conta: payload.id_conta,
    fl_ativo: true,
    ...(busca ? { tx_descricao: { contains: busca, mode: "insensitive" as const } } : {}),
  };

  const [grupos, total] = await Promise.all([
    prisma.grupoConta.findMany({ where, orderBy: { tx_descricao: "asc" } }),
    prisma.grupoConta.count({ where }),
  ]);

  return NextResponse.json({ grupos, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_descricao?.trim()) {
    return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });
  }

  const grupo = await prisma.grupoConta.create({
    data: {
      tx_descricao: body.tx_descricao.trim(),
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(grupo, { status: 201 });
}
