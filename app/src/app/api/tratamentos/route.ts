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
  const situacao = url.searchParams.get("situacao") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {
    id_conta: payload.id_conta,
    fl_ativo: true,
  };
  if (busca) {
    where.paciente = { tx_nome: { contains: busca, mode: "insensitive" } };
  }
  if (situacao) {
    where.cd_situacao = situacao;
  }

  const [tratamentos, total] = await Promise.all([
    prisma.tratamento.findMany({
      where,
      orderBy: { dt_inicio: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        paciente: { select: { tx_nome: true } },
        prestador: { select: { tx_nome: true } },
        unidade: { select: { tx_descricao: true } },
      },
    }),
    prisma.tratamento.count({ where }),
  ]);

  return NextResponse.json({ tratamentos, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.id_paciente || !body.id_prestador_crd) {
    return NextResponse.json({ error: "Paciente e prestador são obrigatórios" }, { status: 400 });
  }

  const tratamento = await prisma.tratamento.create({
    data: {
      dt_inicio: body.dt_inicio ? new Date(body.dt_inicio) : new Date(),
      id_paciente: body.id_paciente,
      id_prestador_crd: body.id_prestador_crd,
      id_prestador_exe: body.id_prestador_exe || null,
      id_prestador_sol: body.id_prestador_sol || null,
      id_unidade_atendimento: body.id_unidade_atendimento || null,
      id_beneficio: body.id_beneficio || null,
      id_tab_prc: body.id_tab_prc || null,
      id_moeda: body.id_moeda || "R$",
      id_tipo_faturamento_tratamento: body.id_tipo_faturamento_tratamento || null,
      id_tipo_atendimento: body.id_tipo_atendimento || null,
      id_tipo_arcada: body.id_tipo_arcada || null,
      id_credenciamento: body.id_credenciamento || null,
      id_especialidade: body.id_especialidade || null,
      id_operadora: body.id_operadora || null,
      id_categoria_conta: body.id_categoria_conta || null,
      id_cpagar_conta: body.id_cpagar_conta || null,
      id_tipo_pagto: body.id_tipo_pagto || null,
      id_sinais_doenca: body.id_sinais_doenca || null,
      id_tecidos_moles: body.id_tecidos_moles || null,
      tx_observacoes: body.tx_observacoes || null,
      tx_anotacoes: body.tx_anotacoes || null,
      dt_autorizacao: body.dt_autorizacao ? new Date(body.dt_autorizacao) : null,
      tx_numero_guia: body.tx_numero_guia || null,
      tx_senha_convenio: body.tx_senha_convenio || null,
      dt_validade_senha: body.dt_validade_senha ? new Date(body.dt_validade_senha) : null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(tratamento, { status: 201 });
}
