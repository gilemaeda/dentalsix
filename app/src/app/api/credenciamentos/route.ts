import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const credenciamentos = await prisma.credenciamento.findMany({
    where: { id_conta: payload.id_conta, fl_ativo: true },
    orderBy: { dt_criacao: "desc" },
    include: {
      prestador: { select: { tx_nome: true } },
      convenio: { select: { tx_descricao: true } },
    },
    take: 50,
  });

  return NextResponse.json({ credenciamentos, total: credenciamentos.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_prestador) {
    return NextResponse.json({ error: "Prestador é obrigatório" }, { status: 400 });
  }

  const credenciamento = await prisma.credenciamento.create({
    data: {
      id_prestador: body.id_prestador,
      id_operadora: body.id_operadora || null,
      tx_codigo: body.tx_codigo || null,
      id_tab_prc: body.id_tab_prc || null,
      vl_us: body.vl_us || null,
      tx_alerta: body.tx_alerta || null,
      tx_observacoes: body.tx_observacoes || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(credenciamento, { status: 201 });
}
