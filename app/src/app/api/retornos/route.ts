import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const retornos = await prisma.retorno.findMany({
    where: { id_conta: payload.id_conta, fl_ativo: true },
    orderBy: { dt_criacao: "desc" },
    include: {
      prestador: { select: { tx_nome: true } },
      paciente: { select: { tx_nome: true } },
    },
    take: 50,
  });

  return NextResponse.json({ retornos, total: retornos.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_prestador || !body.id_paciente) {
    return NextResponse.json({ error: "Prestador e paciente são obrigatórios" }, { status: 400 });
  }

  const retorno = await prisma.retorno.create({
    data: {
      id_prestador: body.id_prestador,
      id_paciente: body.id_paciente,
      vl_mes: body.vl_mes || null,
      vl_ano: body.vl_ano || null,
      id_motivo: body.id_motivo || null,
      tx_observacoes: body.tx_observacoes || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(retorno, { status: 201 });
}
