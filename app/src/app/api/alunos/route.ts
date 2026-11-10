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

  const alunos = await prisma.aluno.findMany({
    where: {
      fl_ativo: true,
      escola: { id_conta: payload.id_conta },
      ...(busca ? { tx_aluno: { contains: busca, mode: "insensitive" as const } } : {}),
    },
    orderBy: { tx_aluno: "asc" },
    include: { escola: { select: { tx_escola: true } } },
  });

  return NextResponse.json({ alunos, total: alunos.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_aluno?.trim() || !body.id_escola) {
    return NextResponse.json({ error: "Nome e escola são obrigatórios" }, { status: 400 });
  }

  const escola = await prisma.escola.findFirst({
    where: { id_escola: body.id_escola, id_conta: payload.id_conta },
  });
  if (!escola) return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 });

  const aluno = await prisma.aluno.create({
    data: {
      tx_aluno: body.tx_aluno.trim(),
      tx_cpf: body.tx_cpf || null,
      tx_aluno_apelido: body.tx_aluno_apelido || null,
      tx_matricula: body.tx_matricula || null,
      tx_email: body.tx_email || null,
      tx_login: body.tx_login || null,
      id_escola: body.id_escola,
    },
  });

  return NextResponse.json(aluno, { status: 201 });
}
