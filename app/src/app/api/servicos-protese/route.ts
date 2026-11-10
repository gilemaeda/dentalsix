import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const cd_status = url.searchParams.get("cd_status");
  const id_fornecedor = url.searchParams.get("id_fornecedor");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (cd_status) where.cd_status = cd_status;
  if (id_fornecedor) where.id_fornecedor = parseInt(id_fornecedor);

  const [servicos, total] = await Promise.all([
    prisma.servicoProtese.findMany({
      where,
      orderBy: { dt_criacao: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.servicoProtese.count({ where }),
  ]);

  return NextResponse.json({ servicos, total, page, limit });
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

  const servico = await prisma.servicoProtese.create({
    data: {
      tx_descricao: body.tx_descricao.trim(),
      id_pt_item: body.id_pt_item || null,
      id_pt_header: body.id_pt_header || null,
      id_fornecedor: body.id_fornecedor || null,
      id_prestador: body.id_prestador || null,
      dt_envio: body.dt_envio ? new Date(body.dt_envio) : null,
      dt_previsao: body.dt_previsao ? new Date(body.dt_previsao) : null,
      dt_retorno: body.dt_retorno ? new Date(body.dt_retorno) : null,
      vl_custo: body.vl_custo || null,
      vl_valor: body.vl_valor || null,
      tx_observacoes: body.tx_observacoes || null,
      cd_status: body.cd_status || "Solicitado",
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(servico, { status: 201 });
}
