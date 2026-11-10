import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const contas = await prisma.contaBancaria.findMany({
    where: { id_conta: payload.id_conta, fl_ativo: true },
    orderBy: { tx_nome_conta: "asc" },
    include: {
      prestador: { select: { tx_nome: true } },
    },
  });

  return NextResponse.json({ contas, total: contas.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome_conta?.trim()) {
    return NextResponse.json({ error: "Nome da conta é obrigatório" }, { status: 400 });
  }

  const conta = await prisma.contaBancaria.create({
    data: {
      tx_nome_conta: body.tx_nome_conta.trim(),
      id_prestador: body.id_prestador || null,
      id_banco: body.id_banco || null,
      tx_agencia: body.tx_agencia || null,
      tx_conta: body.tx_conta || null,
      tx_dv_conta: body.tx_dv_conta || null,
      id_tipo_conta_bancaria: body.id_tipo_conta_bancaria || "Conta-corrente",
      tx_nome_titular: body.tx_nome_titular || null,
      tx_cnpj_titular: body.tx_cnpj_titular || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(conta, { status: 201 });
}
