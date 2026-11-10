import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const data = url.searchParams.get("data") || new Date().toISOString().split("T")[0];
  const tipo = url.searchParams.get("tipo") || "itens";

  if (tipo === "config") {
    const agendas = await prisma.agenda.findMany({
      where: { id_conta: payload.id_conta, fl_ativo: true },
      orderBy: { tx_descricao: "asc" },
      include: { prestador: { select: { tx_nome: true, tx_apelido: true } } },
    });
    return NextResponse.json({ agendas, total: agendas.length });
  }

  const inicio = new Date(data + "T00:00:00");
  const fim = new Date(data + "T23:59:59");

  const itens = await prisma.agendaItem.findMany({
    where: {
      id_conta: payload.id_conta,
      fl_ativo: true,
      dt_inicio: { gte: inicio, lte: fim },
    },
    orderBy: { dt_inicio: "asc" },
    include: {
      paciente: { select: { tx_nome: true } },
      prestador: { select: { tx_nome: true, tx_apelido: true } },
      agenda: { select: { tx_descricao: true } },
    },
  });

  return NextResponse.json({ itens, total: itens.length });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();

  if (body._tipo === "agenda_config") {
    if (!body.id_prestador) {
      return NextResponse.json({ error: "Prestador é obrigatório" }, { status: 400 });
    }
    const agenda = await prisma.agenda.create({
      data: {
        tx_descricao: body.tx_descricao || "Agenda",
        id_prestador: body.id_prestador,
        dt_inicio: body.dt_inicio || "08:00",
        dt_fim: body.dt_fim || "18:00",
        nr_intervalo: body.nr_intervalo || 30,
        vl_duracao_padrao: body.vl_duracao_padrao || 30,
        id_cor: body.id_cor || null,
        fl_omitir_domingo: body.fl_omitir_domingo ?? true,
        fl_omitir_sabado: body.fl_omitir_sabado ?? false,
        fl_notificacao_email: body.fl_notificacao_email ?? false,
        tx_notificacao_email: body.tx_notificacao_email || null,
        fl_agendamento_simultaneo: body.fl_agendamento_simultaneo ?? false,
        fl_elegibilidade_automatica: body.fl_elegibilidade_automatica ?? false,
        fl_autoagendamento: body.fl_autoagendamento ?? false,
        fl_confirmacao_agendamento: body.fl_confirmacao_agendamento ?? false,
        fl_lembrete_agendamento: body.fl_lembrete_agendamento ?? false,
        fl_protocolo_agendamento: body.fl_protocolo_agendamento ?? false,
        fl_lembrete_retorno: body.fl_lembrete_retorno ?? false,
        id_conta: payload.id_conta,
      },
    });
    return NextResponse.json(agenda, { status: 201 });
  }

  if (!body.dt_inicio || !body.id_paciente || !body.id_prestador || !body.id_agenda) {
    return NextResponse.json({ error: "Data, paciente, prestador e agenda são obrigatórios" }, { status: 400 });
  }

  const dtInicio = new Date(body.dt_inicio);
  const dtFim = body.dt_fim ? new Date(body.dt_fim) : new Date(dtInicio.getTime() + 30 * 60000);

  const item = await prisma.agendaItem.create({
    data: {
      dt_inicio: dtInicio,
      dt_fim: dtFim,
      tx_observacao: body.tx_observacao || null,
      tx_descricao: body.tx_descricao || null,
      cd_status: body.cd_status || "AGENDADO",
      id_tipo: body.id_tipo || null,
      id_motivo_agendamento: body.id_motivo_agendamento || null,
      id_unidade_atendimento: body.id_unidade_atendimento || null,
      id_pt_header: body.id_pt_header || null,
      id_pt_item: body.id_pt_item || null,
      id_operadora: body.id_operadora || null,
      vl_duracao: body.vl_duracao || null,
      // Phone for confirmation
      id_tipo_fone1: body.id_tipo_fone1 || null,
      tx_fone_ddd1: body.tx_fone_ddd1 || null,
      tx_fone_nro1: body.tx_fone_nro1 || null,
      id_tipo_fone2: body.id_tipo_fone2 || null,
      tx_fone_ddd2: body.tx_fone_ddd2 || null,
      tx_fone_nro2: body.tx_fone_nro2 || null,
      // Copy/recurrence
      fl_copiar: body.fl_copiar || false,
      id_copia_tipo: body.id_copia_tipo || null,
      vl_copia_dia: body.vl_copia_dia || null,
      vl_copia_semana: body.vl_copia_semana || null,
      vl_copia_mes: body.vl_copia_mes || null,
      fl_enviar_sms: body.fl_enviar_sms || false,
      // Escola
      id_turma: body.id_turma || null,
      id_disciplina: body.id_disciplina || null,
      id_curso: body.id_curso || null,
      id_agenda: body.id_agenda,
      id_paciente: body.id_paciente,
      id_prestador: body.id_prestador,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
