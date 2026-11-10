import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id_prestador = url.searchParams.get("id_prestador");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_prestador) where.id_prestador = parseInt(id_prestador);

  const [repasses, total] = await Promise.all([
    prisma.repasse.findMany({
      where,
      orderBy: { dt_criacao: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.repasse.count({ where }),
  ]);

  return NextResponse.json({ repasses, total, page, limit });
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

  const repasse = await prisma.repasse.create({
    data: {
      id_prestador: body.id_prestador,
      id_modalidade_repasse: body.id_modalidade_repasse || null,
      id_unidade_atendimento: body.id_unidade_atendimento || null,
      dt_periodo_inicio: body.dt_periodo_inicio ? new Date(body.dt_periodo_inicio) : null,
      dt_periodo_fim: body.dt_periodo_fim ? new Date(body.dt_periodo_fim) : null,
      dt_credito: body.dt_credito ? new Date(body.dt_credito) : null,
      dt_efetivacao: body.dt_efetivacao ? new Date(body.dt_efetivacao) : null,
      vl_total: body.vl_total || null,
      vl_bruto: body.vl_bruto || null,
      vl_desconto: body.vl_desconto || null,
      vl_acrescimo: body.vl_acrescimo || null,
      tx_desconto: body.tx_desconto || null,
      tx_acrescimo: body.tx_acrescimo || null,
      tx_observacoes: body.tx_observacoes || null,
      id_efetivar: body.id_efetivar || null,
      id_conta_debito: body.id_conta_debito || null,
      id_categoria: body.id_categoria || null,
      id_forma_pagamento: body.id_forma_pagamento || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(repasse, { status: 201 });
}
