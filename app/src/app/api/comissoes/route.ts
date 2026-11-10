import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id_prestador = url.searchParams.get("id_prestador");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_prestador) where.id_prestador = parseInt(id_prestador);

  const [regras, total] = await Promise.all([
    prisma.regraComissao.findMany({
      where,
      orderBy: { dt_criacao: "desc" },
    }),
    prisma.regraComissao.count({ where }),
  ]);

  return NextResponse.json({ regras, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_prestador) {
    return NextResponse.json({ error: "Prestador é obrigatório" }, { status: 400 });
  }

  const regra = await prisma.regraComissao.create({
    data: {
      id_prestador: body.id_prestador,
      cd_modalidade: body.cd_modalidade || null,
      vl_percentual: body.vl_percentual || null,
      vl_valor: body.vl_valor || null,
      id_tab_prc_item: body.id_tab_prc_item || null,
      id_especialidade: body.id_especialidade || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(regra, { status: 201 });
}
