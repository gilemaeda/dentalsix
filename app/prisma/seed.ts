import { PrismaClient, TipoConta } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const conta = await prisma.conta.upsert({
    where: { id_conta: 1 },
    update: {},
    create: {
      tx_nome: "GAPO Odontologia",
      cd_tipo: TipoConta.CLINICA_I,
      fl_ativo: true,
    },
  });

  const unidade = await prisma.unidadeAtendimento.upsert({
    where: { id_unidade_atendimento: 1 },
    update: {},
    create: {
      tx_descricao: "Clínica 1",
      fl_ativo: true,
      id_conta: conta.id_conta,
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

  const especialidades = [
    "Odontologia Geral",
    "Ortodontia",
    "Endodontia",
    "Periodontia",
    "Cirurgia",
    "Prótese",
    "Implantodontia",
    "Odontopediatria",
    "Estética",
    "Radiologia",
  ];

  for (let i = 0; i < especialidades.length; i++) {
    await prisma.especialidade.upsert({
      where: { id_especialidade: i + 1 },
      update: {},
      create: {
        tx_descricao: especialidades[i],
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
    });
  }

  await prisma.prestador.upsert({
    where: { id_prestador: 1 },
    update: {},
    create: {
      tx_nome: "Dr. Exemplo",
      tx_cpf: "000.000.000-00",
      tx_cro: "12345",
      id_cro_uf: "SP",
      fl_habilitado: true,
      fl_ativo: true,
      id_conta: conta.id_conta,
      id_especialidade: 1,
    },
  });

  const tabelaProc = await prisma.tabelaProcedimento.upsert({
    where: { id_tab_prc: 1 },
    update: {},
    create: {
      tx_descricao: "EDS - Particular",
      fl_ativo: true,
      id_conta: conta.id_conta,
    },
  });

  const tabelaMat = await prisma.tabelaMaterial.upsert({
    where: { id_tab_mat: 1 },
    update: {},
    create: {
      tx_descricao: "Materiais odontológicos",
      fl_ativo: true,
      id_conta: conta.id_conta,
    },
  });

  const contaBancaria = await prisma.contaBancaria.upsert({
    where: { id_cpagar_conta: 1 },
    update: {},
    create: {
      tx_nome_conta: "CX GAPO",
      id_tipo_conta_bancaria: "CAIXA",
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
      create: {
        tx_descricao: mod.tx_descricao,
        tx_alias: mod.tx_alias,
        nr_ordem: mod.nr_ordem,
        tx_icone: mod.tx_icone,
        fl_ativo: true,
        id_conta: conta.id_conta,
      },
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

  console.log("Seed completed:", {
    conta: conta.tx_nome,
    unidade: unidade.tx_descricao,
    admin: admin.tx_email,
    tabelaProc: tabelaProc.tx_descricao,
    tabelaMat: tabelaMat.tx_descricao,
    contaBancaria: contaBancaria.tx_nome_conta,
    especialidades: especialidades.length,
    modulos: modulos.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
