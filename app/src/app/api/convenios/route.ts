import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const convenios = await prisma.convenio.findMany({
    where: { id_conta: payload.id_conta },
    orderBy: { tx_descricao: "asc" },
  });

  return NextResponse.json({ convenios });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_descricao?.trim()) return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });

  const convenio = await prisma.convenio.create({
    data: { tx_descricao: body.tx_descricao.trim(), id_conta: payload.id_conta },
  });

  return NextResponse.json(convenio, { status: 201 });
}
