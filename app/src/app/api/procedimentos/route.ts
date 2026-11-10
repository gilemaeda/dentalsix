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

  const procedimentos = await prisma.procedimentoItem.findMany({
    where: {
      fl_ativo: true,
      tabela: { id_conta: payload.id_conta },
      ...(busca
        ? {
            OR: [
              { tx_nome: { contains: busca, mode: "insensitive" as const } },
              { cd_tab_prc_item: { contains: busca } },
            ],
          }
        : {}),
    },
    orderBy: { tx_nome: "asc" },
    include: {
      especialidade: { select: { tx_descricao: true } },
      tabela: { select: { tx_descricao: true } },
    },
    take: 100,
  });

  return NextResponse.json({ procedimentos, total: procedimentos.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome?.trim() || !body.id_tab_prc) {
    return NextResponse.json({ error: "Nome e tabela são obrigatórios" }, { status: 400 });
  }

  const tabela = await prisma.tabelaProcedimento.findFirst({
    where: { id_tab_prc: body.id_tab_prc, id_conta: payload.id_conta },
  });
  if (!tabela) return NextResponse.json({ error: "Tabela não encontrada" }, { status: 404 });

  const procedimento = await prisma.procedimentoItem.create({
    data: {
      tx_nome: body.tx_nome.trim(),
      cd_tab_prc_item: body.cd_tab_prc_item || null,
      vl_pac: body.vl_pac || null,
      vl_rep: body.vl_rep || null,
      vl_tempo: body.vl_tempo || null,
      id_tipo_cal_prc: body.id_tipo_cal_prc || "Procedimento",
      fl_favorito: body.fl_favorito || false,
      id_tab_prc: body.id_tab_prc,
      id_especialidade: body.id_especialidade || null,
    },
  });

  return NextResponse.json(procedimento, { status: 201 });
}
