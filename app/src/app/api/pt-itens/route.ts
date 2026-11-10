import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id_pt_header = url.searchParams.get("id_pt_header");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_pt_header) where.id_pt_header = parseInt(id_pt_header);

  const [itens, total] = await Promise.all([
    prisma.ptItem.findMany({
      where,
      orderBy: { vl_sequencia: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tratamento: { select: { id_pt_header: true } },
      },
    }),
    prisma.ptItem.count({ where }),
  ]);

  return NextResponse.json({ itens, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_pt_header || !body.id_tab_prc_item) {
    return NextResponse.json({ error: "Tratamento e procedimento são obrigatórios" }, { status: 400 });
  }

  const item = await prisma.ptItem.create({
    data: {
      id_pt_header: body.id_pt_header,
      id_tab_prc_item: body.id_tab_prc_item,
      id_tab_prc: body.id_tab_prc || null,
      id_prestador_exe: body.id_prestador_exe || null,
      id_especialidade: body.id_especialidade || null,
      id_status: body.id_status || null,
      vl_sequencia: body.vl_sequencia || 1,
      vl_pac: body.vl_pac || null,
      vl_rep: body.vl_rep || null,
      vl_des: body.vl_des || null,
      vl_perc_des: body.vl_perc_des || null,
      vl_tot: body.vl_tot || null,
      vl_orc: body.vl_orc || null,
      tx_faces: body.tx_faces || null,
      tx_regiao: body.tx_regiao || null,
      tx_observacoes: body.tx_observacoes || null,
      id_tipo_marcacao: body.id_tipo_marcacao || null,
      vl_bmp_dentes: body.vl_bmp_dentes || null,
      vl_bmp_faces: body.vl_bmp_faces || null,
      id_simbolo: body.id_simbolo || null,
      id_operadora: body.id_operadora || null,
      fl_particular: body.fl_particular ?? true,
      vl_tempo_sessao: body.vl_tempo_sessao || null,
      id_fase_procedimento: body.id_fase_procedimento || null,
      fl_orcamento: body.fl_orcamento ?? false,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
