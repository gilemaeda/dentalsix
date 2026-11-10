import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const de = url.searchParams.get("de") || "";
  const ate = url.searchParams.get("ate") || "";
  const pago = url.searchParams.get("pago");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (de) where.dt_vencimento = { ...(where.dt_vencimento as object || {}), gte: new Date(de) };
  if (ate) where.dt_vencimento = { ...(where.dt_vencimento as object || {}), lte: new Date(ate) };
  if (pago === "true") where.fl_pago = true;
  if (pago === "false") where.fl_pago = false;

  const [contas, total] = await Promise.all([
    prisma.despesa.findMany({
      where,
      orderBy: { dt_vencimento: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        fornecedor: { select: { tx_nome: true } },
        categoria: { select: { tx_descricao: true } },
        contaBancaria: { select: { tx_nome_conta: true } },
      },
    }),
    prisma.despesa.count({ where }),
  ]);

  return NextResponse.json({ contas, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.dt_vencimento || !body.vl_despesa) {
    return NextResponse.json({ error: "Vencimento e valor são obrigatórios" }, { status: 400 });
  }

  const conta = await prisma.despesa.create({
    data: {
      id_tipo_despesa: body.id_tipo_despesa || null,
      dt_vencimento: new Date(body.dt_vencimento),
      tx_documento: body.tx_documento || null,
      tx_historico: body.tx_historico || null,
      vl_despesa: body.vl_despesa,
      vl_pago: body.vl_pago || 0,
      id_tipo_pagto: body.id_tipo_pagto || null,
      id_fornecedor: body.id_fornecedor || null,
      id_unidade_atendimento: body.id_unidade_atendimento || null,
      id_categoria_conta: body.id_categoria_conta || null,
      id_cpagar_conta: body.id_cpagar_conta || null,
      id_mes_competencia: body.id_mes_competencia || null,
      vl_ano_competencia: body.vl_ano_competencia || null,
      vl_meses_copia: body.vl_meses_copia || 1,
      id_prestador_cr: body.id_prestador_cr || null,
      id_paciente_cr: body.id_paciente_cr || null,
      id_operadora_cr: body.id_operadora_cr || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(conta, { status: 201 });
}
