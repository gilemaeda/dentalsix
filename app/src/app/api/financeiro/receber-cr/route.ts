import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id_creceber_db = url.searchParams.get("id_creceber_db");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_creceber_db) where.id_creceber_db = parseInt(id_creceber_db);

  const [creditos, total] = await Promise.all([
    prisma.receberCR.findMany({
      where,
      orderBy: { dt_pagto: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        recebimento: { select: { vl_debito: true, dt_vencimento: true } },
        contaBancaria: { select: { tx_nome_conta: true } },
        categoria: { select: { tx_descricao: true } },
      },
    }),
    prisma.receberCR.count({ where }),
  ]);

  return NextResponse.json({ creditos, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_creceber_db || body.vl_credito == null) {
    return NextResponse.json({ error: "Débito e valor do crédito são obrigatórios" }, { status: 400 });
  }

  const credito = await prisma.receberCR.create({
    data: {
      id_creceber_db: body.id_creceber_db,
      dt_pagto: body.dt_pagto ? new Date(body.dt_pagto) : new Date(),
      dt_compensacao: body.dt_compensacao ? new Date(body.dt_compensacao) : null,
      vl_credito: body.vl_credito,
      vl_pagamento: body.vl_pagamento || body.vl_credito,
      vl_desconto: body.vl_desconto || 0,
      vl_multa: body.vl_multa || 0,
      vl_mora: body.vl_mora || 0,
      vl_taxa_cobranca: body.vl_taxa_cobranca || 0,
      id_tipo_pagto: body.id_tipo_pagto || null,
      id_cpagar_conta: body.id_cpagar_conta || null,
      id_categoria_conta: body.id_categoria_conta || null,
      id_paciente: body.id_paciente || null,
      id_pt_header: body.id_pt_header || null,
      tx_historico: body.tx_historico || null,
      tx_nrovenda: body.tx_nrovenda || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(credito, { status: 201 });
}
