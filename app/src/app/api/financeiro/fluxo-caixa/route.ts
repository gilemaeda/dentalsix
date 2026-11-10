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
  const id_cpagar_conta = url.searchParams.get("id_cpagar_conta");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (de) where.dt_lancamento = { ...(where.dt_lancamento as object || {}), gte: new Date(de) };
  if (ate) where.dt_lancamento = { ...(where.dt_lancamento as object || {}), lte: new Date(ate) };
  if (id_cpagar_conta) where.id_cpagar_conta = parseInt(id_cpagar_conta);

  const [lancamentos, total] = await Promise.all([
    prisma.fluxoCaixa.findMany({
      where,
      orderBy: { dt_lancamento: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        contaBancaria: { select: { tx_nome_conta: true } },
        categoria: { select: { tx_descricao: true } },
      },
    }),
    prisma.fluxoCaixa.count({ where }),
  ]);

  return NextResponse.json({ lancamentos, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.dt_lancamento || body.vl_valor == null || !body.id_cpagar_conta) {
    return NextResponse.json({ error: "Data, valor e conta bancária são obrigatórios" }, { status: 400 });
  }

  const lancamento = await prisma.fluxoCaixa.create({
    data: {
      id_tipo_lancamento: body.id_tipo_lancamento || 1,
      id_categoria_conta: body.id_categoria_conta || null,
      id_cpagar_conta: body.id_cpagar_conta,
      id_cpagar_conta_destino: body.id_cpagar_conta_destino || null,
      dt_lancamento: new Date(body.dt_lancamento),
      vl_valor: body.vl_valor,
      cd_tipo_pagto: body.cd_tipo_pagto || null,
      tx_historico: body.tx_historico || null,
      tx_nome_pagante_creditado: body.tx_nome_pagante_creditado || null,
      id_creceber_cr: body.id_creceber_cr || null,
      id_cpagar_cr: body.id_cpagar_cr || null,
      id_prestador: body.id_prestador || null,
      tx_documento: body.tx_documento || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(lancamento, { status: 201 });
}
