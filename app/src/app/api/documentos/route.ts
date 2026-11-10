import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id_paciente = url.searchParams.get("id_paciente");
  const id_tipo_arquivo = url.searchParams.get("id_tipo_arquivo");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_paciente) where.id_paciente = parseInt(id_paciente);
  if (id_tipo_arquivo) where.tx_tipo_arquivo = id_tipo_arquivo;

  const [documentos, total] = await Promise.all([
    prisma.documento.findMany({
      where,
      orderBy: { dt_criacao: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.documento.count({ where }),
  ]);

  return NextResponse.json({ documentos, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_titulo?.trim()) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  const documento = await prisma.documento.create({
    data: {
      tx_titulo: body.tx_titulo.trim(),
      tx_tipo_arquivo: body.tx_tipo_arquivo || null,
      tx_url: body.tx_url || null,
      tx_observacao: body.tx_observacao || null,
      id_paciente: body.id_paciente || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(documento, { status: 201 });
}
