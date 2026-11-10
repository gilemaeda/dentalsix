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
    ...(busca ? { tx_nome_medicamento: { contains: busca, mode: "insensitive" as const } } : {}),
  };

  const [medicamentos, total] = await Promise.all([
    prisma.medicamento.findMany({ where, orderBy: { tx_nome_medicamento: "asc" } }),
    prisma.medicamento.count({ where }),
  ]);

  return NextResponse.json({ medicamentos, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome_medicamento?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const medicamento = await prisma.medicamento.create({
    data: {
      tx_nome_medicamento: body.tx_nome_medicamento.trim(),
      id_classe_terapeutica: body.id_classe_terapeutica || null,
      id_tipo_uso_medicamento: body.id_tipo_uso_medicamento || null,
      id_via_uso_medicamento: body.id_via_uso_medicamento || null,
      tx_posologia: body.tx_posologia || null,
      tx_quantidade: body.tx_quantidade || null,
      tx_observacoes: body.tx_observacoes || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(medicamento, { status: 201 });
}
