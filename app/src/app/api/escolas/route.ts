import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const busca = url.searchParams.get("busca") || "";

  const where = {
    id_conta: payload.id_conta,
    fl_ativo: true,
    ...(busca ? { tx_escola: { contains: busca, mode: "insensitive" as const } } : {}),
  };

  const [escolas, total] = await Promise.all([
    prisma.escola.findMany({ where, orderBy: { tx_escola: "asc" } }),
    prisma.escola.count({ where }),
  ]);

  return NextResponse.json({ escolas, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_escola?.trim()) {
    return NextResponse.json({ error: "Nome da escola é obrigatório" }, { status: 400 });
  }

  const escola = await prisma.escola.create({
    data: {
      tx_escola: body.tx_escola.trim(),
      tx_razao_social: body.tx_razao_social || null,
      tx_cnpj: body.tx_cnpj || null,
      tx_escola_apelido: body.tx_escola_apelido || null,
      tx_cep: body.tx_cep || null,
      id_tipo_logradouro: body.id_tipo_logradouro || null,
      tx_endereco: body.tx_endereco || null,
      tx_numero: body.tx_numero || null,
      tx_complemento: body.tx_complemento || null,
      id_uf: body.id_uf || null,
      id_cidade: body.id_cidade || null,
      id_bairro: body.id_bairro || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(escola, { status: 201 });
}
