import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id_agenda = url.searchParams.get("id_agenda");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (id_agenda) where.id_agenda = parseInt(id_agenda);

  const [bloqueios, total] = await Promise.all([
    prisma.agendaBloqueio.findMany({
      where,
      orderBy: { dt_data_inicio: "desc" },
    }),
    prisma.agendaBloqueio.count({ where }),
  ]);

  return NextResponse.json({ bloqueios, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_agenda) {
    return NextResponse.json({ error: "Agenda é obrigatória" }, { status: 400 });
  }

  const bloqueio = await prisma.agendaBloqueio.create({
    data: {
      id_agenda: body.id_agenda,
      id_unidade_atendimento: body.id_unidade_atendimento || null,
      dt_data_inicio: body.dt_data_inicio ? new Date(body.dt_data_inicio) : null,
      vl_hora_inicio: body.vl_hora_inicio ? new Date(body.vl_hora_inicio) : null,
      vl_hora_final: body.vl_hora_final ? new Date(body.vl_hora_final) : null,
      vl_frq_recorrencia: body.vl_frq_recorrencia || null,
      vl_lim_recorrencia: body.vl_lim_recorrencia || null,
      vl_qtd_recorrencia: body.vl_qtd_recorrencia || null,
      dt_fin_recorrencia: body.dt_fin_recorrencia ? new Date(body.dt_fin_recorrencia) : null,
      dt_termino: body.dt_termino ? new Date(body.dt_termino) : null,
      tx_mensagem: body.tx_mensagem || null,
      tx_recorrencia: body.tx_recorrencia || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(bloqueio, { status: 201 });
}
