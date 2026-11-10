import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const conta = await prisma.conta.upsert({
      where: { id_conta: 1 },
      update: {},
      create: {
        tx_nome: "GAPO Odontologia",
        cd_tipo: "CLINICA_I",
        fl_ativo: true,
      },
    });

    const senhaHash = await bcrypt.hash("DentalSix2026", 12);

    const admin = await prisma.usuario.upsert({
      where: { tx_email: "admin@dentalsix.com" },
      update: {},
      create: {
        tx_login: "admin@dentalsix.com",
        tx_email: "admin@dentalsix.com",
        tx_senha: senhaHash,
        tx_nome: "Administrador",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    await prisma.especialidade.upsert({
      where: { id_especialidade: 1 },
      update: {},
      create: {
        tx_descricao: "Odontologia Geral",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    await prisma.prestador.upsert({
      where: { id_prestador: 1 },
      update: {},
      create: {
        tx_nome: "Dr. Exemplo",
        tx_cro: "CRO-12345",
        id_cro_uf: "SP",
        fl_ativo: true,
        id_conta: conta.id_conta,
        id_especialidade: 1,
      },
    });

    await prisma.unidadeAtendimento.upsert({
      where: { id_unidade_atendimento: 1 },
      update: {},
      create: {
        tx_descricao: "Clinica 1",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    await prisma.tabelaProcedimento.upsert({
      where: { id_tab_prc: 1 },
      update: {},
      create: {
        tx_descricao: "Particular",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    await prisma.tabelaMaterial.upsert({
      where: { id_tab_mat: 1 },
      update: {},
      create: {
        tx_descricao: "Materiais odontológicos",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    const modulos = [
      { tx_descricao: "Início", tx_alias: "home", nr_ordem: 1, tx_icone: "home" },
      { tx_descricao: "Pacientes", tx_alias: "paciente", nr_ordem: 2, tx_icone: "users" },
      { tx_descricao: "Agenda", tx_alias: "calendario", nr_ordem: 3, tx_icone: "calendar" },
      { tx_descricao: "Tratamentos", tx_alias: "tratamento", nr_ordem: 4, tx_icone: "clipboard" },
      { tx_descricao: "Financeiro", tx_alias: "financeiro", nr_ordem: 5, tx_icone: "dollar" },
      { tx_descricao: "Cadastros", tx_alias: "cadastro", nr_ordem: 6, tx_icone: "database" },
      { tx_descricao: "Relatórios", tx_alias: "relatorio", nr_ordem: 7, tx_icone: "chart" },
      { tx_descricao: "Configurações", tx_alias: "configuracao", nr_ordem: 8, tx_icone: "settings" },
    ];

    for (const mod of modulos) {
      await prisma.appModulo.upsert({
        where: { id_modulo: mod.nr_ordem },
        update: {},
        create: { ...mod, fl_ativo: true, id_conta: conta.id_conta },
      });

      await prisma.loginPermissao.upsert({
        where: {
          id_usuario_id_modulo: {
            id_usuario: admin.id_usuario,
            id_modulo: mod.nr_ordem,
          },
        },
        update: {},
        create: {
          id_usuario: admin.id_usuario,
          id_modulo: mod.nr_ordem,
          fl_consultar: true,
          fl_inserir: true,
          fl_alterar: true,
          fl_excluir: true,
        },
      });
    }

    // --- Procedimentos padrão ---
    const procedimentos = [
      { tx_nome: "Consulta Inicial", cd_tab_prc_item: "01001", vl_pac: 150.0 },
      { tx_nome: "Restauração Resina Composta (1 face)", cd_tab_prc_item: "02001", vl_pac: 250.0 },
      { tx_nome: "Restauração Resina Composta (2 faces)", cd_tab_prc_item: "02002", vl_pac: 350.0 },
      { tx_nome: "Profilaxia / Limpeza", cd_tab_prc_item: "03001", vl_pac: 200.0 },
      { tx_nome: "Exodontia Simples", cd_tab_prc_item: "04001", vl_pac: 300.0 },
      { tx_nome: "Tratamento Endodôntico (Unirradicular)", cd_tab_prc_item: "05001", vl_pac: 800.0 },
      { tx_nome: "Tratamento Endodôntico (Birradicular)", cd_tab_prc_item: "05002", vl_pac: 1000.0 },
      { tx_nome: "Clareamento Dental (Sessão)", cd_tab_prc_item: "06001", vl_pac: 400.0 },
      { tx_nome: "Coroa Total Cerâmica", cd_tab_prc_item: "07001", vl_pac: 1800.0 },
      { tx_nome: "Radiografia Periapical", cd_tab_prc_item: "08001", vl_pac: 50.0 },
    ];
    for (let i = 0; i < procedimentos.length; i++) {
      await prisma.procedimentoItem.upsert({
        where: { id_tab_prc_item: i + 1 },
        update: {},
        create: {
          tx_nome: procedimentos[i].tx_nome,
          cd_tab_prc_item: procedimentos[i].cd_tab_prc_item,
          vl_pac: procedimentos[i].vl_pac,
          fl_ativo: true,
          id_tab_prc: 1,
        },
      });
    }

    // --- Paciente exemplo ---
    await prisma.paciente.upsert({
      where: { id_paciente: 1 },
      update: {},
      create: {
        tx_nome: "João da Silva",
        tx_cpf: "000.000.000-00",
        dt_nascimento: new Date("1990-05-15"),
        id_sexo: "M",
        tx_fone_ddd1: "11",
        tx_fone_nro1: "999990001",
        tx_email1: "joao.silva@exemplo.com",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    // --- Agenda padrão (Consultório 1, Dr. Exemplo) ---
    await prisma.agenda.upsert({
      where: { id_agenda: 1 },
      update: {},
      create: {
        tx_descricao: "Consultório 1 - Dr. Exemplo",
        id_prestador: 1,
        nr_intervalo: 30,
        dt_inicio: "08:00",
        dt_fim: "18:00",
        cd_dia_semana: "SEG,TER,QUA,QUI,SEX",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    // --- Categoria financeira padrão ---
    await prisma.categoriaConta.upsert({
      where: { id_categoria_conta: 1 },
      update: {},
      create: {
        tx_descricao: "Procedimentos Odontológicos",
        cd_tipo: "RECEITA",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    // --- Convênio padrão ---
    await prisma.convenio.upsert({
      where: { id_convenio: 1 },
      update: {},
      create: {
        tx_descricao: "Particular",
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Seed completed — conta, admin, procedimentos, paciente, agenda, financeiro",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
