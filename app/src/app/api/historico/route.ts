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
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_paciente) where.id_paciente = parseInt(id_paciente);

  const [registros, total] = await Promise.all([
    prisma.historico.findMany({
      where,
      orderBy: { dt_data: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.historico.count({ where }),
  ]);

  return NextResponse.json({ registros, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();

  const historico = await prisma.historico.create({
    data: {
      tx_descricao: body.tx_descricao || "",
      cd_tipo: body.cd_tipo || null,
      id_paciente: body.id_paciente || null,
      id_prestador: body.id_prestador || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(historico, { status: 201 });
}
