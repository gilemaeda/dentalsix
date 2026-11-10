import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id_cpagar_db = url.searchParams.get("id_cpagar_db");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_cpagar_db) where.id_cpagar_db = parseInt(id_cpagar_db);

  const [pagamentos, total] = await Promise.all([
    prisma.pagarCR.findMany({
      where,
      orderBy: { dt_pagto: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pagarCR.count({ where }),
  ]);

  return NextResponse.json({ pagamentos, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_cpagar_db || body.vl_pagamento == null) {
    return NextResponse.json({ error: "Despesa e valor do pagamento são obrigatórios" }, { status: 400 });
  }

  const pagamento = await prisma.pagarCR.create({
    data: {
      id_cpagar_db: body.id_cpagar_db,
      id_cpagar_conta: body.id_cpagar_conta || null,
      id_categoria_conta: body.id_categoria_conta || null,
      id_tipo_pagto: body.id_tipo_pagto || null,
      dt_pagto: body.dt_pagto ? new Date(body.dt_pagto) : new Date(),
      dt_compensacao: body.dt_compensacao ? new Date(body.dt_compensacao) : null,
      vl_pagamento: body.vl_pagamento,
      vl_desconto: body.vl_desconto || 0,
      vl_multa: body.vl_multa || 0,
      vl_mora: body.vl_mora || 0,
      tx_historico: body.tx_historico || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(pagamento, { status: 201 });
}
