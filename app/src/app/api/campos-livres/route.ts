import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const where = { id_conta: payload.id_conta, fl_ativo: true };

  const [campos, total] = await Promise.all([
    prisma.campoLivre.findMany({ where, orderBy: { vl_ordem: "asc" } }),
    prisma.campoLivre.count({ where }),
  ]);

  return NextResponse.json({ campos, total });
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

  const campo = await prisma.campoLivre.create({
    data: {
      tx_descricao: body.tx_descricao.trim(),
      cd_tipo: body.cd_tipo || null,
      vl_ordem: body.vl_ordem || null,
      fl_obrigatorio: body.fl_obrigatorio || false,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(campo, { status: 201 });
}
