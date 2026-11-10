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

  const docentes = await prisma.docente.findMany({
    where: {
      fl_ativo: true,
      escola: { id_conta: payload.id_conta },
      ...(busca ? { tx_docente: { contains: busca, mode: "insensitive" as const } } : {}),
    },
    orderBy: { tx_docente: "asc" },
    include: { escola: { select: { tx_escola: true } } },
  });

  return NextResponse.json({ docentes, total: docentes.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_docente?.trim() || !body.id_escola) {
    return NextResponse.json({ error: "Nome e escola são obrigatórios" }, { status: 400 });
  }

  const escola = await prisma.escola.findFirst({
    where: { id_escola: body.id_escola, id_conta: payload.id_conta },
  });
  if (!escola) return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 });

  const docente = await prisma.docente.create({
    data: {
      tx_docente: body.tx_docente.trim(),
      tx_cpf: body.tx_cpf || null,
      tx_cro: body.tx_cro || null,
      id_cro_uf: body.id_cro_uf || null,
      tx_docente_apelido: body.tx_docente_apelido || null,
      tx_matricula: body.tx_matricula || null,
      tx_email: body.tx_email || null,
      tx_login: body.tx_login || null,
      id_escola: body.id_escola,
    },
  });

  return NextResponse.json(docente, { status: 201 });
}
