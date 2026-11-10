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

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_paciente) where.id_paciente = parseInt(id_paciente);

  const [beneficios, total] = await Promise.all([
    prisma.beneficio.findMany({
      where,
      orderBy: { dt_criacao: "desc" },
    }),
    prisma.beneficio.count({ where }),
  ]);

  return NextResponse.json({ beneficios, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_paciente) {
    return NextResponse.json({ error: "Paciente é obrigatório" }, { status: 400 });
  }

  const beneficio = await prisma.beneficio.create({
    data: {
      id_paciente: body.id_paciente,
      id_operadora: body.id_operadora || null,
      id_produto: body.id_produto || null,
      id_tab_prc: body.id_tab_prc || null,
      tx_matricula: body.tx_matricula || null,
      tx_titular: body.tx_titular || null,
      tx_empresa: body.tx_empresa || null,
      dt_validade: body.dt_validade ? new Date(body.dt_validade) : null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(beneficio, { status: 201 });
}
