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
    ...(busca
      ? {
          OR: [
            { tx_nome: { contains: busca, mode: "insensitive" as const } },
            { tx_cnpj: { contains: busca } },
          ],
        }
      : {}),
  };

  const [fornecedores, total] = await Promise.all([
    prisma.fornecedor.findMany({ where, orderBy: { tx_nome: "asc" } }),
    prisma.fornecedor.count({ where }),
  ]);

  return NextResponse.json({ fornecedores, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const fornecedor = await prisma.fornecedor.create({
    data: {
      tx_nome: body.tx_nome.trim(),
      tx_razao_social: body.tx_razao_social || null,
      tx_cnpj: body.tx_cnpj || null,
      id_segmento_fornecedor: body.id_segmento_fornecedor || null,
      id_tipo_fone1: body.id_tipo_fone1 || "Celular",
      tx_fone_ddd1: body.tx_fone_ddd1 || null,
      tx_fone_nro1: body.tx_fone_nro1 || null,
      id_tipo_email1: body.id_tipo_email1 || "Corporativo",
      tx_email1: body.tx_email1 || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(fornecedor, { status: 201 });
}
