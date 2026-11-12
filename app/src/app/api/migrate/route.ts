import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MIGRATION_STATEMENTS = [
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoConta') THEN CREATE TYPE "TipoConta" AS ENUM ('CONSULTORIO', 'CLINICA_I', 'CLINICA_II', 'ADMIN'); END IF; END $$`,

  `CREATE TABLE IF NOT EXISTS "conta" (
    "id_conta" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "cd_tipo" "TipoConta" NOT NULL DEFAULT 'CONSULTORIO',
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "usuario" (
    "id_usuario" SERIAL PRIMARY KEY,
    "tx_login" VARCHAR(200) NOT NULL,
    "tx_email" VARCHAR(200) NOT NULL,
    "tx_senha" VARCHAR(200) NOT NULL,
    "tx_nome" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    "id_prestador" INTEGER,
    "id_perfil" INTEGER,
    CONSTRAINT "usuario_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "usuario_tx_email_key" ON "usuario"("tx_email")`,

  `CREATE TABLE IF NOT EXISTS "especialidade" (
    "id_especialidade" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "especialidade_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "prestador" (
    "id_prestador" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "tx_apelido" VARCHAR(100),
    "tx_cpf" VARCHAR(14),
    "tx_cro" VARCHAR(50),
    "id_cro_uf" VARCHAR(2),
    "tx_email" VARCHAR(200),
    "tx_celular" VARCHAR(20),
    "cd_tipo" VARCHAR(50),
    "fl_habilitado" BOOLEAN NOT NULL DEFAULT true,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    "id_especialidade" INTEGER,
    "id_prestador_principal" INTEGER,
    CONSTRAINT "prestador_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta"),
    CONSTRAINT "prestador_id_especialidade_fkey" FOREIGN KEY ("id_especialidade") REFERENCES "especialidade"("id_especialidade")
  )`,

  `CREATE TABLE IF NOT EXISTS "paciente" (
    "id_paciente" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "dt_nascimento" TIMESTAMP(3),
    "id_sexo" VARCHAR(20),
    "tx_cpf" VARCHAR(14),
    "id_doc_tipo" VARCHAR(20),
    "tx_doc_nro" VARCHAR(30),
    "id_tipo_fone1" VARCHAR(20),
    "tx_fone_ddd1" VARCHAR(4),
    "tx_fone_nro1" VARCHAR(20),
    "tx_fone_ram1" VARCHAR(10),
    "id_tipo_fone2" VARCHAR(20),
    "tx_fone_ddd2" VARCHAR(4),
    "tx_fone_nro2" VARCHAR(20),
    "tx_fone_ram2" VARCHAR(10),
    "id_tipo_email1" VARCHAR(20),
    "tx_email1" VARCHAR(200),
    "fl_publico" BOOLEAN NOT NULL DEFAULT false,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    "id_prestador_res" INTEGER,
    CONSTRAINT "paciente_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "convenio" (
    "id_convenio" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "convenio_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "unidade_atendimento" (
    "id_unidade_atendimento" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "unidade_atendimento_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "fornecedor" (
    "id_fornecedor" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "tx_razao_social" VARCHAR(200),
    "tx_cnpj" VARCHAR(18),
    "id_segmento_fornecedor" VARCHAR(100),
    "id_tipo_fone1" VARCHAR(20),
    "tx_fone_ddd1" VARCHAR(3),
    "tx_fone_nro1" VARCHAR(20),
    "tx_fone_ram1" VARCHAR(10),
    "id_tipo_fone2" VARCHAR(20),
    "tx_fone_ddd2" VARCHAR(3),
    "tx_fone_nro2" VARCHAR(20),
    "tx_fone_ram2" VARCHAR(10),
    "id_tipo_email1" VARCHAR(20),
    "tx_email1" VARCHAR(200),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "fornecedor_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "conta_bancaria" (
    "id_cpagar_conta" SERIAL PRIMARY KEY,
    "tx_nome_conta" VARCHAR(200) NOT NULL,
    "id_banco" VARCHAR(100),
    "tx_agencia" VARCHAR(20),
    "tx_conta" VARCHAR(30),
    "tx_dv_conta" VARCHAR(5),
    "id_tipo_conta_bancaria" VARCHAR(30),
    "tx_nome_titular" VARCHAR(200),
    "tx_cnpj_titular" VARCHAR(18),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "conta_bancaria_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta"),
    CONSTRAINT "conta_bancaria_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador")
  )`,

  `CREATE TABLE IF NOT EXISTS "categoria_conta" (
    "id_categoria_conta" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "cd_tipo" VARCHAR(20),
    "id_grupo" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "categoria_conta_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "tratamento" (
    "id_pt_header" SERIAL PRIMARY KEY,
    "dt_inicio" TIMESTAMP(3) NOT NULL,
    "cd_situacao" VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    "id_beneficio" VARCHAR(100),
    "id_tab_prc" INTEGER,
    "id_moeda" VARCHAR(10),
    "id_tipo_faturamento_tratamento" VARCHAR(50),
    "id_tipo_atendimento" VARCHAR(50),
    "tx_observacoes" TEXT,
    "id_tipo_arcada" VARCHAR(30),
    "id_prestador_sol" INTEGER,
    "id_prestador_exe" INTEGER,
    "dt_autorizacao" TIMESTAMP(3),
    "tx_numero_guia" VARCHAR(50),
    "tx_senha_convenio" VARCHAR(50),
    "dt_validade_senha" TIMESTAMP(3),
    "id_sinais_doenca" VARCHAR(100),
    "id_tecidos_moles" VARCHAR(100),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador_crd" INTEGER NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_unidade_atendimento" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "tratamento_id_prestador_crd_fkey" FOREIGN KEY ("id_prestador_crd") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "tratamento_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "tratamento_id_unidade_fkey" FOREIGN KEY ("id_unidade_atendimento") REFERENCES "unidade_atendimento"("id_unidade_atendimento"),
    CONSTRAINT "tratamento_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "tabela_procedimento" (
    "id_tab_prc" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "tabela_procedimento_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "procedimento_item" (
    "id_tab_prc_item" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(300) NOT NULL,
    "cd_tab_prc_item" VARCHAR(20),
    "id_tab_gen_item" VARCHAR(100),
    "vl_pac" DECIMAL(12,2),
    "vl_rep" DECIMAL(12,2),
    "id_tipo_cal_prc" VARCHAR(30),
    "vl_tempo" INTEGER,
    "fl_favorito" BOOLEAN NOT NULL DEFAULT false,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_tab_prc" INTEGER NOT NULL,
    "id_especialidade" INTEGER,
    CONSTRAINT "procedimento_item_id_tab_prc_fkey" FOREIGN KEY ("id_tab_prc") REFERENCES "tabela_procedimento"("id_tab_prc"),
    CONSTRAINT "procedimento_item_id_especialidade_fkey" FOREIGN KEY ("id_especialidade") REFERENCES "especialidade"("id_especialidade")
  )`,

  `CREATE TABLE IF NOT EXISTS "tabela_material" (
    "id_tab_mat" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "tabela_material_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "material_item" (
    "id_tab_mat_item" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "tx_codigo" VARCHAR(30),
    "id_grupo_material" VARCHAR(100),
    "id_tab_mat_gen_item" VARCHAR(100),
    "id_unid_consumo" VARCHAR(30),
    "vl_qtd_min" DECIMAL(12,2),
    "tx_observacoes" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_tab_mat" INTEGER NOT NULL,
    CONSTRAINT "material_item_id_tab_mat_fkey" FOREIGN KEY ("id_tab_mat") REFERENCES "tabela_material"("id_tab_mat")
  )`,

  `CREATE TABLE IF NOT EXISTS "medicamento" (
    "id_medicamento" SERIAL PRIMARY KEY,
    "tx_nome_medicamento" VARCHAR(200) NOT NULL,
    "id_classe_terapeutica" VARCHAR(100),
    "id_tipo_uso_medicamento" VARCHAR(50),
    "id_via_uso_medicamento" VARCHAR(50),
    "tx_posologia" TEXT,
    "tx_quantidade" VARCHAR(50),
    "tx_observacoes" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "medicamento_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "recebimento" (
    "id_receber_db" SERIAL PRIMARY KEY,
    "id_tipo_receita" VARCHAR(50),
    "dt_vencimento" TIMESTAMP(3) NOT NULL,
    "tx_historico" VARCHAR(500),
    "vl_debito" DECIMAL(12,2) NOT NULL,
    "vl_credito" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "id_tipo_pagto" VARCHAR(50),
    "fl_pago" BOOLEAN NOT NULL DEFAULT false,
    "id_mes_competencia" VARCHAR(20),
    "vl_ano_competencia" INTEGER,
    "vl_meses_copia" INTEGER DEFAULT 1,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_paciente" INTEGER,
    "id_pt_header" INTEGER,
    "id_unidade_atendimento" INTEGER,
    "id_categoria_conta" INTEGER,
    "id_cpagar_conta" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "recebimento_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "recebimento_id_pt_header_fkey" FOREIGN KEY ("id_pt_header") REFERENCES "tratamento"("id_pt_header"),
    CONSTRAINT "recebimento_id_unidade_fkey" FOREIGN KEY ("id_unidade_atendimento") REFERENCES "unidade_atendimento"("id_unidade_atendimento"),
    CONSTRAINT "recebimento_id_categoria_fkey" FOREIGN KEY ("id_categoria_conta") REFERENCES "categoria_conta"("id_categoria_conta"),
    CONSTRAINT "recebimento_id_conta_bancaria_fkey" FOREIGN KEY ("id_cpagar_conta") REFERENCES "conta_bancaria"("id_cpagar_conta"),
    CONSTRAINT "recebimento_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "despesa" (
    "id_cpagar_db" SERIAL PRIMARY KEY,
    "id_tipo_despesa" VARCHAR(50),
    "dt_vencimento" TIMESTAMP(3) NOT NULL,
    "tx_documento" VARCHAR(100),
    "tx_historico" VARCHAR(500),
    "vl_despesa" DECIMAL(12,2) NOT NULL,
    "vl_pago" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "id_tipo_pagto" VARCHAR(50),
    "fl_pago" BOOLEAN NOT NULL DEFAULT false,
    "id_mes_competencia" VARCHAR(20),
    "vl_ano_competencia" INTEGER,
    "vl_meses_copia" INTEGER DEFAULT 1,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_fornecedor" INTEGER,
    "id_unidade_atendimento" INTEGER,
    "id_categoria_conta" INTEGER,
    "id_cpagar_conta" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "despesa_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedor"("id_fornecedor"),
    CONSTRAINT "despesa_id_unidade_fkey" FOREIGN KEY ("id_unidade_atendimento") REFERENCES "unidade_atendimento"("id_unidade_atendimento"),
    CONSTRAINT "despesa_id_categoria_fkey" FOREIGN KEY ("id_categoria_conta") REFERENCES "categoria_conta"("id_categoria_conta"),
    CONSTRAINT "despesa_id_conta_bancaria_fkey" FOREIGN KEY ("id_cpagar_conta") REFERENCES "conta_bancaria"("id_cpagar_conta"),
    CONSTRAINT "despesa_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "retorno" (
    "id_retorno" SERIAL PRIMARY KEY,
    "vl_mes" VARCHAR(20),
    "vl_ano" INTEGER,
    "id_motivo" VARCHAR(100),
    "tx_observacoes" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "retorno_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "retorno_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "retorno_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "credenciamento" (
    "id_credenciamento" SERIAL PRIMARY KEY,
    "tx_codigo" VARCHAR(50),
    "id_tab_prc" INTEGER,
    "vl_us" DECIMAL(12,4),
    "tx_alerta" TEXT,
    "tx_observacoes" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER NOT NULL,
    "id_unidade_atendimento" INTEGER,
    "id_operadora" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "credenciamento_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "credenciamento_id_operadora_fkey" FOREIGN KEY ("id_operadora") REFERENCES "convenio"("id_convenio"),
    CONSTRAINT "credenciamento_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "estoque_item" (
    "id_estoque_item" SERIAL PRIMARY KEY,
    "vl_custo_medio" DECIMAL(12,4),
    "vl_qtd_min" DECIMAL(12,2),
    "vl_saldo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_tab_mat_item" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "estoque_item_id_mat_fkey" FOREIGN KEY ("id_tab_mat_item") REFERENCES "material_item"("id_tab_mat_item"),
    CONSTRAINT "estoque_item_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "estoque_movimento" (
    "id_estoque_mov" SERIAL PRIMARY KEY,
    "cd_tipo" VARCHAR(20) NOT NULL,
    "vl_quantidade" DECIMAL(12,2) NOT NULL,
    "vl_custo_unit" DECIMAL(12,4),
    "dt_validade" TIMESTAMP(3),
    "tx_fornecedor" VARCHAR(200),
    "tx_observacao" TEXT,
    "fl_cancelado" BOOLEAN NOT NULL DEFAULT false,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_estoque_item" INTEGER NOT NULL,
    CONSTRAINT "estoque_mov_id_item_fkey" FOREIGN KEY ("id_estoque_item") REFERENCES "estoque_item"("id_estoque_item")
  )`,

  `CREATE TABLE IF NOT EXISTS "escola" (
    "id_escola" SERIAL PRIMARY KEY,
    "tx_escola" VARCHAR(200) NOT NULL,
    "tx_razao_social" VARCHAR(200),
    "tx_cnpj" VARCHAR(18),
    "tx_escola_apelido" VARCHAR(100),
    "tx_cep" VARCHAR(10),
    "id_tipo_logradouro" VARCHAR(5),
    "tx_endereco" VARCHAR(200),
    "tx_numero" VARCHAR(20),
    "tx_complemento" VARCHAR(100),
    "id_uf" VARCHAR(2),
    "id_cidade" VARCHAR(100),
    "id_bairro" VARCHAR(100),
    "fl_habilitado" BOOLEAN NOT NULL DEFAULT true,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "escola_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "docente" (
    "id_docente" SERIAL PRIMARY KEY,
    "tx_docente" VARCHAR(200) NOT NULL,
    "tx_cpf" VARCHAR(14),
    "tx_cro" VARCHAR(50),
    "id_cro_uf" VARCHAR(2),
    "tx_docente_apelido" VARCHAR(100),
    "tx_matricula" VARCHAR(50),
    "id_tipo_fone" VARCHAR(20),
    "tx_fone_ddd" VARCHAR(3),
    "tx_fone_nro" VARCHAR(20),
    "id_tipo_email" VARCHAR(20),
    "tx_email" VARCHAR(200),
    "tx_login" VARCHAR(200),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_escola" INTEGER NOT NULL,
    CONSTRAINT "docente_id_escola_fkey" FOREIGN KEY ("id_escola") REFERENCES "escola"("id_escola")
  )`,

  `CREATE TABLE IF NOT EXISTS "aluno" (
    "id_aluno" SERIAL PRIMARY KEY,
    "tx_aluno" VARCHAR(200) NOT NULL,
    "tx_cpf" VARCHAR(14),
    "tx_aluno_apelido" VARCHAR(100),
    "tx_matricula" VARCHAR(50),
    "id_tipo_fone" VARCHAR(20),
    "tx_fone_ddd" VARCHAR(3),
    "tx_fone_nro" VARCHAR(20),
    "id_tipo_email" VARCHAR(20),
    "tx_email" VARCHAR(200),
    "tx_login" VARCHAR(200),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_escola" INTEGER NOT NULL,
    CONSTRAINT "aluno_id_escola_fkey" FOREIGN KEY ("id_escola") REFERENCES "escola"("id_escola")
  )`,

  `CREATE TABLE IF NOT EXISTS "curso" (
    "id_curso" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "tx_descricao" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_escola" INTEGER NOT NULL,
    CONSTRAINT "curso_id_escola_fkey" FOREIGN KEY ("id_escola") REFERENCES "escola"("id_escola")
  )`,

  `CREATE TABLE IF NOT EXISTS "disciplina" (
    "id_disciplina" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "tx_codigo" VARCHAR(30),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_curso" INTEGER NOT NULL,
    CONSTRAINT "disciplina_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso")
  )`,

  `CREATE TABLE IF NOT EXISTS "turma" (
    "id_turma" SERIAL PRIMARY KEY,
    "tx_turma" VARCHAR(100) NOT NULL,
    "dt_inicio" TIMESTAMP(3),
    "dt_termino" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_disciplina" INTEGER NOT NULL,
    CONSTRAINT "turma_id_disciplina_fkey" FOREIGN KEY ("id_disciplina") REFERENCES "disciplina"("id_disciplina")
  )`,

  `CREATE TABLE IF NOT EXISTS "agenda" (
    "id_agenda" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_inicio" VARCHAR(5),
    "dt_fim" VARCHAR(5),
    "cd_dia_semana" VARCHAR(20),
    "nr_intervalo" INTEGER NOT NULL DEFAULT 30,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "agenda_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "agenda_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "agenda_item" (
    "id_agenda_item" SERIAL PRIMARY KEY,
    "dt_inicio" TIMESTAMP(3) NOT NULL,
    "dt_fim" TIMESTAMP(3) NOT NULL,
    "tx_observacao" TEXT,
    "cd_status" VARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_agenda" INTEGER NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_prestador" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "agenda_item_id_agenda_fkey" FOREIGN KEY ("id_agenda") REFERENCES "agenda"("id_agenda"),
    CONSTRAINT "agenda_item_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "agenda_item_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "agenda_item_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "app_modulo" (
    "id_modulo" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "tx_alias" VARCHAR(100),
    "nr_ordem" INTEGER NOT NULL DEFAULT 0,
    "id_grupo" INTEGER,
    "tx_icone" VARCHAR(50),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER,
    CONSTRAINT "app_modulo_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "login_permissao" (
    "id_login_permissao" SERIAL PRIMARY KEY,
    "fl_consultar" BOOLEAN NOT NULL DEFAULT false,
    "fl_inserir" BOOLEAN NOT NULL DEFAULT false,
    "fl_alterar" BOOLEAN NOT NULL DEFAULT false,
    "fl_excluir" BOOLEAN NOT NULL DEFAULT false,
    "id_usuario" INTEGER NOT NULL,
    "id_modulo" INTEGER NOT NULL,
    CONSTRAINT "login_permissao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario"),
    CONSTRAINT "login_permissao_id_modulo_fkey" FOREIGN KEY ("id_modulo") REFERENCES "app_modulo"("id_modulo")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "login_permissao_id_usuario_id_modulo_key" ON "login_permissao"("id_usuario", "id_modulo")`,

  `CREATE TABLE IF NOT EXISTS "sessao" (
    "id_sessao" SERIAL PRIMARY KEY,
    "dt_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dt_expiracao" TIMESTAMP(3) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_usuario" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "sessao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
  )`,

  // ─── NEW TABLES ────────────────────────────────────────────────

  `CREATE TABLE IF NOT EXISTS "pt_item" (
    "id_pt_item" SERIAL PRIMARY KEY,
    "id_tab_prc_item" INTEGER,
    "id_tab_prc" INTEGER,
    "id_status" INTEGER,
    "cd_status" VARCHAR(20),
    "vl_sequencia" INTEGER,
    "tx_faces" VARCHAR(50),
    "tx_regiao" VARCHAR(100),
    "tx_observacoes" TEXT,
    "dt_finalizacao" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "fl_autorizado" BOOLEAN NOT NULL DEFAULT false,
    "id_glosa" INTEGER,
    "cd_glosa" VARCHAR(50),
    "id_cobertura" INTEGER,
    "vl_pac" DECIMAL(12,2),
    "vl_rep" DECIMAL(12,2),
    "vl_qtd_us_pac" DECIMAL(12,4),
    "vl_qtd_us_rep" DECIMAL(12,4),
    "vl_us_pac" DECIMAL(12,4),
    "vl_us_rep" DECIMAL(12,4),
    "id_tipo_marcacao" INTEGER,
    "vl_bmp_dentes" INTEGER,
    "vl_bmp_faces" INTEGER,
    "id_simbolo" INTEGER,
    "id_operadora" INTEGER,
    "fl_particular" BOOLEAN NOT NULL DEFAULT false,
    "vl_tempo_sessao" INTEGER,
    "fl_recorrente" BOOLEAN NOT NULL DEFAULT false,
    "vl_glo" DECIMAL(12,2),
    "vl_perc_des" DECIMAL(5,2),
    "vl_des" DECIMAL(12,2),
    "vl_tot" DECIMAL(12,2),
    "vl_orc" DECIMAL(12,2),
    "vl_dur" INTEGER,
    "vl_cst_prt" DECIMAL(12,2),
    "vl_cst_mat" DECIMAL(12,2),
    "vl_cst_out" DECIMAL(12,2),
    "vl_cst_tot" DECIMAL(12,2),
    "fl_orcamento" BOOLEAN NOT NULL DEFAULT false,
    "fl_finaliza" BOOLEAN NOT NULL DEFAULT false,
    "id_fase_procedimento" INTEGER,
    "id_agenda_item" INTEGER,
    "fl_regiao_prc" BOOLEAN NOT NULL DEFAULT false,
    "fl_assinatura" BOOLEAN NOT NULL DEFAULT false,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_pt_header" INTEGER NOT NULL,
    "id_prestador_exe" INTEGER,
    "id_especialidade" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pt_item_id_pt_header_fkey" FOREIGN KEY ("id_pt_header") REFERENCES "tratamento"("id_pt_header"),
    CONSTRAINT "pt_item_id_prestador_fkey" FOREIGN KEY ("id_prestador_exe") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "pt_item_id_especialidade_fkey" FOREIGN KEY ("id_especialidade") REFERENCES "especialidade"("id_especialidade"),
    CONSTRAINT "pt_item_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "pt_arcada" (
    "id_pt_arcada" SERIAL PRIMARY KEY,
    "id_pt_header" INTEGER NOT NULL,
    CONSTRAINT "pt_arcada_id_pt_header_fkey" FOREIGN KEY ("id_pt_header") REFERENCES "tratamento"("id_pt_header")
  )`,

  `CREATE TABLE IF NOT EXISTS "pt_arcada_dente" (
    "id_pt_arcada_dente" SERIAL PRIMARY KEY,
    "vl_dente" INTEGER,
    "vl_face" INTEGER,
    "vl_simbolo" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_pt_arcada" INTEGER NOT NULL,
    CONSTRAINT "pt_arcada_dente_id_arcada_fkey" FOREIGN KEY ("id_pt_arcada") REFERENCES "pt_arcada"("id_pt_arcada")
  )`,

  `CREATE TABLE IF NOT EXISTS "receber_cr" (
    "id_creceber_cr" SERIAL PRIMARY KEY,
    "dt_pagto" TIMESTAMP(3),
    "dt_compensacao" TIMESTAMP(3),
    "vl_pagamento" DECIMAL(12,2),
    "vl_credito" DECIMAL(12,2),
    "vl_desconto" DECIMAL(12,2),
    "vl_taxa_cobranca" DECIMAL(12,2),
    "vl_multa" DECIMAL(12,2),
    "vl_mora" DECIMAL(12,2),
    "tx_historico" VARCHAR(500),
    "tx_nrovenda" VARCHAR(30),
    "id_recibo" INTEGER,
    "id_tipo_pagto" VARCHAR(50),
    "id_tipo_cal_taxa_cobranca" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_fluxo_caixa" INTEGER,
    "id_creceber_db" INTEGER NOT NULL,
    "id_cpagar_conta" INTEGER,
    "id_pt_header" INTEGER,
    "id_paciente" INTEGER,
    "id_categoria_conta" INTEGER,
    "id_prestador" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "receber_cr_id_db_fkey" FOREIGN KEY ("id_creceber_db") REFERENCES "recebimento"("id_receber_db"),
    CONSTRAINT "receber_cr_id_conta_bancaria_fkey" FOREIGN KEY ("id_cpagar_conta") REFERENCES "conta_bancaria"("id_cpagar_conta"),
    CONSTRAINT "receber_cr_id_pt_header_fkey" FOREIGN KEY ("id_pt_header") REFERENCES "tratamento"("id_pt_header"),
    CONSTRAINT "receber_cr_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "receber_cr_id_categoria_fkey" FOREIGN KEY ("id_categoria_conta") REFERENCES "categoria_conta"("id_categoria_conta"),
    CONSTRAINT "receber_cr_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "receber_cr_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "fluxo_caixa" (
    "id_lancamento" SERIAL PRIMARY KEY,
    "id_tipo_lancamento" INTEGER,
    "dt_lancamento" TIMESTAMP(3) NOT NULL,
    "vl_valor" DECIMAL(12,2) NOT NULL,
    "vl_saldo" DECIMAL(12,2),
    "cd_tipo_pagto" VARCHAR(50),
    "id_creceber_cr" INTEGER,
    "id_cpagar_cr" INTEGER,
    "tx_historico" VARCHAR(500),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "fl_multiplas_contas" BOOLEAN NOT NULL DEFAULT false,
    "tx_documento" VARCHAR(100),
    "id_lancamento_origem" INTEGER,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_cpagar_conta_destino" INTEGER,
    "id_categoria_conta" INTEGER,
    "id_cpagar_conta" INTEGER,
    "id_prestador" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "fluxo_caixa_id_categoria_fkey" FOREIGN KEY ("id_categoria_conta") REFERENCES "categoria_conta"("id_categoria_conta"),
    CONSTRAINT "fluxo_caixa_id_conta_bancaria_fkey" FOREIGN KEY ("id_cpagar_conta") REFERENCES "conta_bancaria"("id_cpagar_conta"),
    CONSTRAINT "fluxo_caixa_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "fluxo_caixa_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "anamnese" (
    "id_anamnese" SERIAL PRIMARY KEY,
    "tx_nome_questionario" VARCHAR(200),
    "tx_nome_abreviado" VARCHAR(30),
    "tx_observacao" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "fl_reservado" BOOLEAN NOT NULL DEFAULT false,
    "id_tipo_copia" INTEGER,
    "id_anamnese_copia" INTEGER,
    "tx_subtitulo" VARCHAR(200),
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "anamnese_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "anamnese_item" (
    "id_anamnese_item" SERIAL PRIMARY KEY,
    "id_cf_controle" INTEGER,
    "tx_pergunta" TEXT,
    "tx_itens_resposta" TEXT,
    "fl_complemento" BOOLEAN NOT NULL DEFAULT false,
    "tx_ajuda_complemento" TEXT,
    "fl_alerta" BOOLEAN NOT NULL DEFAULT false,
    "tx_itens_alerta" TEXT,
    "tx_msg_alerta" TEXT,
    "vl_ordem" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_anamnese" INTEGER NOT NULL,
    CONSTRAINT "anamnese_item_id_anamnese_fkey" FOREIGN KEY ("id_anamnese") REFERENCES "anamnese"("id_anamnese")
  )`,

  `CREATE TABLE IF NOT EXISTS "editor_texto" (
    "id_editor_texto" SERIAL PRIMARY KEY,
    "tx_titulo" VARCHAR(200),
    "tx_conteudo" TEXT,
    "cd_tipo" VARCHAR(50),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "editor_texto_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "documento" (
    "id_documento" SERIAL PRIMARY KEY,
    "tx_titulo" VARCHAR(200),
    "tx_tipo_arquivo" VARCHAR(50),
    "tx_url" TEXT,
    "tx_observacao" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_paciente" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "documento_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "documento_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "historico" (
    "id_historico" SERIAL PRIMARY KEY,
    "tx_descricao" TEXT,
    "cd_tipo" VARCHAR(50),
    "dt_data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_paciente" INTEGER,
    "id_prestador" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "historico_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "historico_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "historico_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "regra_comissao" (
    "id_regra_comissao" SERIAL PRIMARY KEY,
    "cd_modalidade" VARCHAR(50),
    "vl_percentual" DECIMAL(5,2),
    "vl_valor" DECIMAL(12,2),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER,
    "id_tab_prc_item" INTEGER,
    "id_especialidade" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "regra_comissao_id_prestador_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "regra_comissao_id_prc_item_fkey" FOREIGN KEY ("id_tab_prc_item") REFERENCES "procedimento_item"("id_tab_prc_item"),
    CONSTRAINT "regra_comissao_id_especialidade_fkey" FOREIGN KEY ("id_especialidade") REFERENCES "especialidade"("id_especialidade"),
    CONSTRAINT "regra_comissao_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "cartao_transacao" (
    "id_cartao_transacao" SERIAL PRIMARY KEY,
    "tx_transacao" VARCHAR(100),
    "cd_bandeira" VARCHAR(50),
    "cd_tipo_cartao" VARCHAR(30),
    "vl_valor" DECIMAL(12,2),
    "vl_taxa" DECIMAL(12,4),
    "dt_transacao" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_creceber_cr" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "cartao_transacao_id_cr_fkey" FOREIGN KEY ("id_creceber_cr") REFERENCES "receber_cr"("id_creceber_cr"),
    CONSTRAINT "cartao_transacao_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "perfil" (
    "id_perfil" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200) NOT NULL,
    "tx_descricao" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "perfil_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "repasse" (
    "id_repasse" SERIAL PRIMARY KEY,
    "id_prestador" INTEGER,
    "id_especialidade" INTEGER,
    "cd_modalidade_repasse" VARCHAR(50),
    "vl_percentual" DECIMAL(5,2),
    "vl_valor" DECIMAL(12,2),
    "tx_observacoes" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "repasse_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "grupo_conta" (
    "id_grupo_conta" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200) NOT NULL,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "grupo_conta_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "campo_livre" (
    "id_campo_livre" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200),
    "cd_tipo" VARCHAR(50),
    "vl_ordem" INTEGER,
    "fl_obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "campo_livre_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "agenda_bloqueio" (
    "id_agenda_bloqueio" SERIAL PRIMARY KEY,
    "id_agenda" INTEGER NOT NULL,
    "id_unidade_atendimento" INTEGER,
    "dt_data_inicio" TIMESTAMP(3),
    "vl_hora_inicio" TIMESTAMP(3),
    "vl_hora_final" TIMESTAMP(3),
    "vl_frq_recorrencia" INTEGER,
    "vl_lim_recorrencia" INTEGER,
    "vl_qtd_recorrencia" INTEGER,
    "dt_fin_recorrencia" TIMESTAMP(3),
    "dt_termino" TIMESTAMP(3),
    "tx_mensagem" TEXT,
    "tx_recorrencia" VARCHAR(100),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "agenda_bloqueio_id_agenda_fkey" FOREIGN KEY ("id_agenda") REFERENCES "agenda"("id_agenda"),
    CONSTRAINT "agenda_bloqueio_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "agenda_reserva" (
    "id_agenda_reserva" SERIAL PRIMARY KEY,
    "id_agenda" INTEGER NOT NULL,
    "id_unidade_atendimento" INTEGER,
    "dt_data_inicio" TIMESTAMP(3),
    "vl_hora_inicio" TIMESTAMP(3),
    "vl_hora_final" TIMESTAMP(3),
    "vl_frq_recorrencia" INTEGER,
    "vl_lim_recorrencia" INTEGER,
    "vl_qtd_recorrencia" INTEGER,
    "dt_fin_recorrencia" TIMESTAMP(3),
    "dt_termino" TIMESTAMP(3),
    "tx_mensagem" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "agenda_reserva_id_agenda_fkey" FOREIGN KEY ("id_agenda") REFERENCES "agenda"("id_agenda"),
    CONSTRAINT "agenda_reserva_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "paciente_beneficio" (
    "id_beneficio" SERIAL PRIMARY KEY,
    "id_paciente" INTEGER,
    "id_operadora" INTEGER,
    "id_produto" VARCHAR(50),
    "id_tab_prc" INTEGER,
    "tx_matricula" VARCHAR(30),
    "tx_titular" VARCHAR(200),
    "tx_empresa" VARCHAR(200),
    "dt_validade" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "beneficio_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "cpagar_cr" (
    "id_cpagar_cr" SERIAL PRIMARY KEY,
    "id_cpagar_db" INTEGER,
    "id_cpagar_conta" INTEGER,
    "id_categoria_conta" INTEGER,
    "id_tipo_pagto" VARCHAR(50),
    "dt_pagto" TIMESTAMP(3),
    "dt_compensacao" TIMESTAMP(3),
    "vl_pagamento" DECIMAL(12,2),
    "vl_desconto" DECIMAL(12,2),
    "vl_multa" DECIMAL(12,2),
    "vl_mora" DECIMAL(12,2),
    "tx_historico" VARCHAR(500),
    "id_fluxo_caixa" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "cpagar_cr_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "servico_protese" (
    "id_servico_protese" SERIAL PRIMARY KEY,
    "id_pt_item" INTEGER,
    "id_pt_header" INTEGER,
    "id_fornecedor" INTEGER,
    "id_prestador" INTEGER,
    "dt_envio" TIMESTAMP(3),
    "dt_previsao" TIMESTAMP(3),
    "dt_retorno" TIMESTAMP(3),
    "vl_custo" DECIMAL(12,2),
    "vl_valor" DECIMAL(12,2),
    "tx_descricao" VARCHAR(500),
    "tx_observacoes" TEXT,
    "cd_status" VARCHAR(50),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "servico_protese_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ─── ALTER TABLE: add new columns to existing tables ───────────

  // Paciente expansions
  ...addColumnsIfNotExist("paciente", [
    ["tx_apelido", "VARCHAR(100)"],
    ["tx_nome_social", "VARCHAR(200)"],
    ["tx_nome_conjuge", "VARCHAR(200)"],
    ["tx_nome_mae", "VARCHAR(200)"],
    ["tx_nome_pai", "VARCHAR(200)"],
    ["id_estado_civil", "VARCHAR(20)"],
    ["id_tipo_indicacao", "VARCHAR(50)"],
    ["tx_indicacao", "VARCHAR(200)"],
    ["tx_prontuario", "VARCHAR(30)"],
    ["tx_observ", "TEXT"],
    ["id_ocupacao", "VARCHAR(50)"],
    ["id_raca", "VARCHAR(20)"],
    ["tx_codigo", "VARCHAR(50)"],
    ["id_situacao", "VARCHAR(20)"],
    ["id_status", "VARCHAR(20)"],
    ["tx_portal", "VARCHAR(255)"],
    ["tx_foto", "TEXT"],
    ["id_tipo_endereco", "VARCHAR(20)"],
    ["tx_cep", "VARCHAR(10)"],
    ["id_tipo_logradouro", "VARCHAR(10)"],
    ["tx_endereco", "VARCHAR(200)"],
    ["tx_numero", "VARCHAR(10)"],
    ["tx_complemento", "VARCHAR(50)"],
    ["tx_referencia", "VARCHAR(100)"],
    ["id_uf", "VARCHAR(2)"],
    ["id_cidade", "VARCHAR(100)"],
    ["id_bairro", "VARCHAR(100)"],
    ["id_tipo_fone3", "VARCHAR(20)"],
    ["tx_fone_ddd3", "VARCHAR(4)"],
    ["tx_fone_nro3", "VARCHAR(20)"],
    ["tx_fone_ram3", "VARCHAR(10)"],
    ["id_tipo_email2", "VARCHAR(20)"],
    ["tx_email2", "VARCHAR(200)"],
    ["fl_tem_plano", "BOOLEAN DEFAULT false"],
    ["id_operadora", "INTEGER"],
    ["id_produto", "VARCHAR(50)"],
    ["id_tab_prc", "INTEGER"],
    ["tx_matricula", "VARCHAR(30)"],
    ["dt_validade", "TIMESTAMP(3)"],
    ["tx_campos_livres", "TEXT"],
  ]),

  // Prestador expansions
  ...addColumnsIfNotExist("prestador", [
    ["cd_tipo_pessoa", "VARCHAR(20)"],
    ["tx_codigo", "VARCHAR(50)"],
    ["id_tipo_prestador", "VARCHAR(50)"],
    ["id_tipo_pessoa", "VARCHAR(50)"],
    ["tx_razao_social", "VARCHAR(200)"],
    ["tx_cnpj", "VARCHAR(18)"],
    ["tx_observacoes", "TEXT"],
    ["tx_email_remetente", "VARCHAR(200)"],
    ["id_resp_sexo", "VARCHAR(20)"],
    ["id_resp_estado_civil", "VARCHAR(20)"],
    ["id_resp_prefixo", "VARCHAR(20)"],
    ["tx_resp_nome", "VARCHAR(200)"],
    ["tx_resp_cpf", "VARCHAR(14)"],
    ["tx_resp_cro", "VARCHAR(50)"],
    ["id_resp_cro_uf", "VARCHAR(2)"],
    ["tx_resp_doc", "VARCHAR(30)"],
    ["id_resp_tipo_doc", "VARCHAR(20)"],
    ["id_resp_doc_uf", "VARCHAR(2)"],
    ["id_resp_doc_orgao", "VARCHAR(50)"],
    ["dt_resp_data_nasc", "TIMESTAMP(3)"],
    ["tx_resp_inss", "VARCHAR(30)"],
    ["id_tipo_endereco", "VARCHAR(20)"],
    ["tx_cep", "VARCHAR(10)"],
    ["id_tipo_logradouro", "VARCHAR(10)"],
    ["tx_endereco", "VARCHAR(200)"],
    ["tx_numero", "VARCHAR(10)"],
    ["tx_complemento", "VARCHAR(50)"],
    ["tx_referencia", "VARCHAR(100)"],
    ["id_uf", "VARCHAR(2)"],
    ["id_cidade", "VARCHAR(100)"],
    ["id_bairro", "VARCHAR(100)"],
    ["id_tipo_fone1", "VARCHAR(20)"],
    ["tx_fone_ddd1", "VARCHAR(4)"],
    ["tx_fone_nro1", "VARCHAR(20)"],
    ["tx_fone_ram1", "VARCHAR(10)"],
    ["id_tipo_fone2", "VARCHAR(20)"],
    ["tx_fone_ddd2", "VARCHAR(4)"],
    ["tx_fone_nro2", "VARCHAR(20)"],
    ["tx_fone_ram2", "VARCHAR(10)"],
    ["id_tipo_email1", "VARCHAR(20)"],
    ["tx_email1", "VARCHAR(200)"],
    ["id_tipo_email2", "VARCHAR(20)"],
    ["tx_email2", "VARCHAR(200)"],
  ]),

  // Agenda expansions
  ...addColumnsIfNotExist("agenda", [
    ["dt_ini_grade", "TIMESTAMP(3)"],
    ["dt_fin_grade", "TIMESTAMP(3)"],
    ["vl_duracao_padrao", "INTEGER"],
    ["vl_zoom", "INTEGER"],
    ["id_formato_agendamento", "INTEGER"],
    ["vl_def_opcao_novo_agendamento", "INTEGER"],
    ["fl_alerta_agendamento", "BOOLEAN DEFAULT false"],
    ["id_def_status", "INTEGER"],
    ["id_status_envio_confirm_enviado", "INTEGER"],
    ["id_status_ret_confirm_sim", "INTEGER"],
    ["id_status_ret_confirm_nao", "INTEGER"],
    ["id_status_ret_confirm_nao_antecedencia", "INTEGER"],
    ["fl_omitir_domingo", "BOOLEAN DEFAULT false"],
    ["fl_omitir_sabado", "BOOLEAN DEFAULT false"],
    ["fl_omitir_nao_utilizados", "BOOLEAN DEFAULT false"],
    ["fl_notificacao_email", "BOOLEAN DEFAULT false"],
    ["tx_notificacao_email", "VARCHAR(200)"],
    ["fl_agendamento_simultaneo", "BOOLEAN DEFAULT false"],
    ["fl_elegibilidade_automatica", "BOOLEAN DEFAULT false"],
    ["fl_informar_procedimento_agenda", "BOOLEAN DEFAULT false"],
    ["id_cor", "INTEGER"],
    ["fl_autoagendamento", "BOOLEAN DEFAULT false"],
    ["fl_confirmacao_agendamento", "BOOLEAN DEFAULT false"],
    ["id_meio_envio_confirmacao", "INTEGER"],
    ["vl_antecedencia_confirmacao", "INTEGER"],
    ["id_texto_envio_confirmacao", "INTEGER"],
    ["fl_lembrete_agendamento", "BOOLEAN DEFAULT false"],
    ["id_meio_envio_lembrete", "INTEGER"],
    ["vl_antecedencia_lembrete", "INTEGER"],
    ["id_texto_envio_lembrete", "INTEGER"],
    ["fl_protocolo_agendamento", "BOOLEAN DEFAULT false"],
    ["id_meio_envio_protocolo", "INTEGER"],
    ["id_texto_envio_protocolo", "INTEGER"],
    ["fl_lembrete_retorno", "BOOLEAN DEFAULT false"],
    ["id_meio_envio_retorno", "INTEGER"],
    ["id_texto_envio_retorno", "INTEGER"],
  ]),

  // AgendaItem expansions
  ...addColumnsIfNotExist("agenda_item", [
    ["id_unidade_atendimento", "INTEGER"],
    ["vl_duracao", "INTEGER"],
    ["vl_sala", "INTEGER"],
    ["id_status", "INTEGER"],
    ["id_tipo", "INTEGER"],
    ["tx_descricao", "VARCHAR(200)"],
    ["tx_descricao2", "VARCHAR(200)"],
    ["id_motivo_agendamento", "VARCHAR(50)"],
    ["id_pt_item", "INTEGER"],
    ["id_tipo_fone1", "VARCHAR(20)"],
    ["tx_fone_ddd1", "VARCHAR(4)"],
    ["tx_fone_nro1", "VARCHAR(20)"],
    ["id_tipo_fone2", "VARCHAR(20)"],
    ["tx_fone_ddd2", "VARCHAR(4)"],
    ["tx_fone_nro2", "VARCHAR(20)"],
    ["id_operadora", "INTEGER"],
    ["id_pt_header", "INTEGER"],
    ["fl_bloqueio", "BOOLEAN DEFAULT false"],
    ["fl_ocultar", "BOOLEAN DEFAULT false"],
    ["fl_copiar", "BOOLEAN DEFAULT false"],
    ["id_copia_tipo", "INTEGER"],
    ["vl_copia_dia", "INTEGER"],
    ["vl_copia_semana", "INTEGER"],
    ["vl_copia_mes", "INTEGER"],
    ["fl_elegibilidade", "BOOLEAN"],
    ["fl_enviar_sms", "BOOLEAN"],
    ["dt_time_stamp_checkin", "TIMESTAMP(3)"],
    ["dt_time_stamp_atendimento", "TIMESTAMP(3)"],
    ["dt_time_stamp_checkout", "TIMESTAMP(3)"],
    ["vl_rgb", "VARCHAR(20)"],
    ["id_turma", "INTEGER"],
    ["id_disciplina", "INTEGER"],
    ["id_curso", "INTEGER"],
  ]),

  // Tratamento expansions
  ...addColumnsIfNotExist("tratamento", [
    ["dt_abertura", "TIMESTAMP(3)"],
    ["dt_finalizacao", "TIMESTAMP(3)"],
    ["dt_vencimento", "TIMESTAMP(3)"],
    ["id_credenciamento", "INTEGER"],
    ["id_especialidade", "INTEGER"],
    ["id_operadora", "INTEGER"],
    ["id_cpagar_conta", "INTEGER"],
    ["id_categoria_conta", "INTEGER"],
    ["id_tipo_pagto", "VARCHAR(50)"],
    ["id_prestador_orc", "INTEGER"],
    ["id_status_pt_header", "INTEGER"],
    ["id_status_guia", "INTEGER"],
    ["cd_associado", "VARCHAR(50)"],
    ["tx_anotacoes", "TEXT"],
    ["fl_imagem", "BOOLEAN DEFAULT false"],
    ["fl_assinatura", "BOOLEAN DEFAULT false"],
    ["fl_carrega_parcela", "BOOLEAN DEFAULT false"],
    ["fl_copia_pendente", "BOOLEAN DEFAULT false"],
    ["id_motivo_finalizacao", "INTEGER"],
    ["tx_mensagem_impressao", "TEXT"],
    ["vl_tot_atu", "DECIMAL(12,2)"],
    ["vl_tot_pac", "DECIMAL(12,2)"],
    ["vl_tot_dif", "DECIMAL(12,2)"],
    ["vl_tot_par", "DECIMAL(12,2)"],
    ["vl_tot_pag", "DECIMAL(12,2)"],
    ["vl_tot_des", "DECIMAL(12,2)"],
    ["vl_tot_cor", "DECIMAL(12,2)"],
    ["vl_tot_sld", "DECIMAL(12,2)"],
  ]),

  // Recebimento expansions
  ...addColumnsIfNotExist("recebimento", [
    ["id_prestador", "INTEGER"],
    ["id_pt_parcela", "INTEGER"],
    ["nr_parcela", "INTEGER"],
    ["vl_tot_credito", "DECIMAL(12,2)"],
    ["vl_tot_taxa_cobranca", "DECIMAL(12,2)"],
    ["vl_tot_desconto", "DECIMAL(12,2)"],
    ["vl_tot_mora", "DECIMAL(12,2)"],
    ["vl_tot_multa", "DECIMAL(12,2)"],
    ["vl_tot_pagamento", "DECIMAL(12,2)"],
    ["vl_saldo", "DECIMAL(12,2)"],
    ["fl_debito_aberto", "BOOLEAN DEFAULT true"],
    ["fl_faturar", "BOOLEAN DEFAULT false"],
    ["fl_recorrente", "BOOLEAN DEFAULT false"],
    ["id_prestador_pg", "INTEGER"],
    ["id_fornecedor_pg", "INTEGER"],
    ["id_operadora_pg", "INTEGER"],
    ["tx_nro_nf", "VARCHAR(50)"],
    ["id_cartao_transacao", "INTEGER"],
  ]),

  // Despesa expansions
  ...addColumnsIfNotExist("despesa", [
    ["id_prestador_cr", "INTEGER"],
    ["id_paciente_cr", "INTEGER"],
    ["id_operadora_cr", "INTEGER"],
    ["fl_possui_anexo", "BOOLEAN DEFAULT false"],
    ["vl_tot_multa", "DECIMAL(12,2)"],
    ["vl_tot_mora", "DECIMAL(12,2)"],
    ["vl_tot_desconto", "DECIMAL(12,2)"],
    ["vl_tot_pagamento", "DECIMAL(12,2)"],
    ["vl_saldo_dia", "DECIMAL(12,2)"],
  ]),

  // Fornecedor expansions
  ...addColumnsIfNotExist("fornecedor", [
    ["tx_observacoes", "TEXT"],
    ["tx_cep", "VARCHAR(10)"],
    ["id_tipo_logradouro", "VARCHAR(10)"],
    ["tx_endereco", "VARCHAR(200)"],
    ["tx_numero", "VARCHAR(10)"],
    ["tx_complemento", "VARCHAR(50)"],
    ["id_uf", "VARCHAR(2)"],
    ["id_cidade", "VARCHAR(100)"],
    ["id_bairro", "VARCHAR(100)"],
    ["tx_apelido", "VARCHAR(100)"],
    ["tx_ie", "VARCHAR(30)"],
    ["tx_homepage", "VARCHAR(500)"],
    ["tx_dados_pagamento", "TEXT"],
    ["tx_foto", "TEXT"],
    ["id_tipo_endereco", "VARCHAR(20)"],
    ["tx_referencia", "VARCHAR(100)"],
  ]),

  // Usuario expansions
  ...addColumnsIfNotExist("usuario", [
    ["cd_usuario", "VARCHAR(50)"],
    ["tx_descricao", "VARCHAR(200)"],
    ["id_agenda", "INTEGER"],
    ["id_tipo_conta", "INTEGER"],
    ["id_tipo_prestador", "INTEGER"],
    ["id_prestador_conta", "INTEGER"],
    ["id_def_cpagar_conta", "INTEGER"],
    ["id_unidade_atendimento", "INTEGER"],
    ["id_def_texto_sms_agendamento", "INTEGER"],
    ["id_def_texto_receita", "INTEGER"],
    ["id_def_texto_atestado", "INTEGER"],
    ["id_def_modelo_etiqueta", "INTEGER"],
    ["id_def_modelo_orcamento", "INTEGER"],
    ["vl_qtd_unidade", "INTEGER"],
    ["vl_saldo_sms", "INTEGER"],
    ["vl_pref_doc_organizar", "VARCHAR(50)"],
    ["vl_pref_doc_tamanho", "VARCHAR(50)"],
    ["tx_ddi_local", "VARCHAR(10)"],
    ["tx_ddd_local", "VARCHAR(10)"],
    ["tx_crm_url", "VARCHAR(500)"],
    ["tx_lista_id_agenda_notify", "TEXT"],
    ["fl_reiniciar", "BOOLEAN DEFAULT false"],
    ["fl_bloquear", "BOOLEAN DEFAULT false"],
    ["fl_reiniciar_senha", "BOOLEAN DEFAULT false"],
    ["fl_esqueci_senha", "BOOLEAN DEFAULT false"],
    ["fl_admin_conta", "BOOLEAN DEFAULT false"],
    ["fl_desmarcar_dentes", "BOOLEAN DEFAULT false"],
    ["fl_remover_9_ddd31", "BOOLEAN DEFAULT false"],
    ["fl_notificacao", "BOOLEAN DEFAULT false"],
    ["fl_controle_horario", "BOOLEAN DEFAULT false"],
    ["fl_controle_unidade", "BOOLEAN DEFAULT false"],
    ["fl_controle_prestador", "BOOLEAN DEFAULT false"],
    ["fl_conectividade_tiss", "BOOLEAN DEFAULT false"],
    ["fl_sig_plataforma", "BOOLEAN DEFAULT false"],
    ["fl_asaas_habilitado", "BOOLEAN DEFAULT false"],
    ["fl_asaas", "BOOLEAN DEFAULT false"],
    ["fl_agenda_unidade", "BOOLEAN DEFAULT false"],
    ["fl_crm", "BOOLEAN DEFAULT false"],
    ["fl_creceber_paciente_ativo", "BOOLEAN DEFAULT false"],
    ["fl_nova_interface_ficha_clinica", "BOOLEAN DEFAULT false"],
    ["fl_nfse_asaas", "BOOLEAN DEFAULT false"],
  ]),

  // Convenio expansions
  ...addColumnsIfNotExist("convenio", [
    ["cd_convenio", "VARCHAR(50)"],
    ["cd_ans_operadora", "VARCHAR(50)"],
    ["id_operadora", "INTEGER"],
    ["id_tab_prc", "INTEGER"],
    ["id_tipo_convenio", "INTEGER"],
    ["fl_regras_cobertura", "BOOLEAN DEFAULT false"],
    ["fl_regras_repasse", "BOOLEAN DEFAULT false"],
    ["tx_cnpj_operadora", "VARCHAR(18)"],
    ["tx_nome_operadora", "VARCHAR(200)"],
    ["tx_razao_operadora", "VARCHAR(200)"],
    ["tx_regras_cobertura", "TEXT"],
    ["tx_regras_repasse", "TEXT"],
    ["tx_tabela_padrao", "VARCHAR(200)"],
  ]),

  // RegraComissao expansions
  ...addColumnsIfNotExist("regra_comissao", [
    ["dt_vigencia", "TIMESTAMP(3)"],
    ["id_operadora", "INTEGER"],
    ["id_tab_prc", "INTEGER"],
    ["id_tab_gen_item", "VARCHAR(100)"],
    ["id_tipo_cal_comissao", "INTEGER"],
    ["id_unidade_atendimento", "INTEGER"],
    ["vl_comissao", "DECIMAL(12,2)"],
  ]),

  // ReceberCR expansions
  ...addColumnsIfNotExist("receber_cr", [
    ["cd_tipo_pagto", "VARCHAR(50)"],
    ["vl_multa_perc", "DECIMAL(5,2)"],
    ["vl_mora_perc", "DECIMAL(5,2)"],
    ["id_tipo_mora", "INTEGER"],
    ["vl_mora_calc", "DECIMAL(12,2)"],
    ["vl_debito", "DECIMAL(12,2)"],
    ["vl_saldo", "DECIMAL(12,2)"],
    ["vl_dias_atraso", "INTEGER"],
    ["dt_vencimento_db", "TIMESTAMP(3)"],
    ["id_creceber_cr_upd", "INTEGER"],
    ["vl_ano_competencia", "INTEGER"],
  ]),

  // FluxoCaixa expansions
  ...addColumnsIfNotExist("fluxo_caixa", [
    ["tx_nome_pagante_creditado", "VARCHAR(200)"],
    ["tx_full_search", "TEXT"],
    ["tx_nr_nfe", "VARCHAR(50)"],
    ["tx_nr_recibo", "VARCHAR(50)"],
  ]),

  // Retorno expansions
  ...addColumnsIfNotExist("retorno", [
    ["cd_motivo_retorno", "VARCHAR(50)"],
    ["id_situacao", "VARCHAR(20)"],
  ]),

  // Agenda extra expansions
  ...addColumnsIfNotExist("agenda", [
    ["tx_agendamento_simultaneo", "VARCHAR(200)"],
    ["id_oauth_google", "VARCHAR(200)"],
    ["id_oauth_boaconsulta", "VARCHAR(200)"],
    ["tx_cor", "VARCHAR(20)"],
    ["vl_cor", "VARCHAR(20)"],
    ["fl_autoagendamento_odp", "BOOLEAN DEFAULT false"],
  ]),

  // Tratamento extra expansions
  ...addColumnsIfNotExist("tratamento", [
    ["cd_status_pt_header", "VARCHAR(50)"],
    ["dt_autorizacao_tiss", "TIMESTAMP(3)"],
    ["dt_venda", "TIMESTAMP(3)"],
    ["fl_calc_diff", "BOOLEAN DEFAULT false"],
    ["fl_cadastro", "BOOLEAN DEFAULT false"],
    ["fl_aniversario", "BOOLEAN DEFAULT false"],
    ["fl_anotacao", "BOOLEAN DEFAULT false"],
    ["fl_debito", "BOOLEAN DEFAULT false"],
    ["fl_agenda_retorno", "BOOLEAN DEFAULT false"],
    ["tx_motivo_exclusao", "TEXT"],
    ["tx_codigo", "VARCHAR(50)"],
  ]),

  // Recebimento extra expansions
  ...addColumnsIfNotExist("recebimento", [
    ["vl_pago", "DECIMAL(12,2)"],
    ["cd_tipo_pagto", "VARCHAR(50)"],
    ["id_checkout_cobranca", "INTEGER"],
    ["id_checkout_cobranca_parcela", "INTEGER"],
    ["cd_checkout_status", "VARCHAR(50)"],
    ["cd_checkout_tipo", "VARCHAR(50)"],
    ["cd_checkout_tipo_gateway", "VARCHAR(50)"],
    ["id_last_creceber_cr", "INTEGER"],
    ["fl_recebimento_pago", "BOOLEAN DEFAULT false"],
    ["tx_nosso_numero", "VARCHAR(50)"],
    ["tx_faturamento", "VARCHAR(200)"],
    ["tx_transacao_numero", "VARCHAR(100)"],
  ]),

  // ─── 22 NEW MODELS ────────────────────────────────────────────

  `CREATE TABLE IF NOT EXISTS "paciente_endereco" (
    "id_pessoa_endereco" SERIAL PRIMARY KEY,
    "id_tipo_endereco" INTEGER,
    "id_tipo_logradouro" INTEGER,
    "tx_cep" VARCHAR(10),
    "tx_endereco" VARCHAR(200),
    "tx_numero" VARCHAR(10),
    "tx_complemento" VARCHAR(100),
    "tx_referencia" VARCHAR(200),
    "id_uf" INTEGER,
    "id_cidade" INTEGER,
    "id_bairro" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_paciente" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pac_end_pac_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "pac_end_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "paciente_fone" (
    "id_pessoa_fone" SERIAL PRIMARY KEY,
    "id_tipo_fone" INTEGER,
    "tx_fone_ddd" VARCHAR(4),
    "tx_fone_nro" VARCHAR(20),
    "tx_fone_ram" VARCHAR(10),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_paciente" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pac_fone_pac_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "pac_fone_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "paciente_email" (
    "id_pessoa_email" SERIAL PRIMARY KEY,
    "id_tipo_email" INTEGER,
    "tx_email" VARCHAR(200),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_paciente" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pac_email_pac_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "pac_email_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "paciente_beneficio_sub" (
    "id_paciente_beneficio" SERIAL PRIMARY KEY,
    "id_operadora" INTEGER,
    "id_produto" INTEGER,
    "id_tab_prc" INTEGER,
    "tx_matricula" VARCHAR(30),
    "tx_titular" VARCHAR(200),
    "tx_empresa" VARCHAR(200),
    "dt_validade" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_paciente" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pac_ben_pac_fkey" FOREIGN KEY ("id_paciente") REFERENCES "paciente"("id_paciente"),
    CONSTRAINT "pac_ben_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "prestador_endereco" (
    "id_prestador_endereco" SERIAL PRIMARY KEY,
    "id_tipo_endereco" INTEGER,
    "id_tipo_logradouro" INTEGER,
    "tx_cep" VARCHAR(10),
    "tx_endereco" VARCHAR(200),
    "tx_numero" VARCHAR(10),
    "tx_complemento" VARCHAR(100),
    "tx_referencia" VARCHAR(200),
    "id_uf" INTEGER,
    "id_cidade" INTEGER,
    "id_bairro" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "prest_end_prest_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "prest_end_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "prestador_fone" (
    "id_prestador_fone" SERIAL PRIMARY KEY,
    "id_tipo_fone" INTEGER,
    "tx_fone_ddd" VARCHAR(4),
    "tx_fone_nro" VARCHAR(20),
    "tx_fone_ram" VARCHAR(10),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "prest_fone_prest_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "prest_fone_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "prestador_email" (
    "id_prestador_email" SERIAL PRIMARY KEY,
    "id_tipo_email" INTEGER,
    "tx_email" VARCHAR(200),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_prestador" INTEGER NOT NULL,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "prest_email_prest_fkey" FOREIGN KEY ("id_prestador") REFERENCES "prestador"("id_prestador"),
    CONSTRAINT "prest_email_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "recibo" (
    "id_recibo" SERIAL PRIMARY KEY,
    "tx_numero" VARCHAR(50),
    "dt_emissao" TIMESTAMP(3),
    "id_paciente" INTEGER,
    "id_prestador" INTEGER,
    "id_pt_header" INTEGER,
    "vl_total" DECIMAL(12,2),
    "tx_descricao" TEXT,
    "tx_observacoes" TEXT,
    "cd_tipo" VARCHAR(30),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "recibo_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "taxa_cobranca" (
    "id_taxa_cobranca" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200),
    "cd_tipo" VARCHAR(50),
    "id_tipo_cal_taxa" INTEGER,
    "vl_percentual" DECIMAL(5,2),
    "vl_valor" DECIMAL(12,2),
    "id_tipo_pagto" INTEGER,
    "id_cpagar_conta" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "taxa_cob_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "simbolo_odonto" (
    "id_simbolo" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200),
    "tx_nome_icone" VARCHAR(100),
    "cd_tipo" VARCHAR(30),
    "vl_ordem" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "simb_odonto_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "pt_item_endo" (
    "id_pt_item_endo" SERIAL PRIMARY KEY,
    "id_pt_item" INTEGER,
    "id_lima_memoria" INTEGER,
    "id_sistema_instrumentacao" INTEGER,
    "id_solucao_irrigadora" INTEGER,
    "id_medicacao_intra_canal" INTEGER,
    "id_cimento_obturador" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pt_endo_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "pt_item_endo_canal" (
    "id_pt_item_endo_canal" SERIAL PRIMARY KEY,
    "id_tipo_canal" INTEGER,
    "tx_canal" VARCHAR(50),
    "vl_ctp" DECIMAL(5,2),
    "vl_crt" DECIMAL(5,2),
    "vl_crd" DECIMAL(5,2),
    "vl_odontometria" DECIMAL(5,2),
    "vl_diametro" DECIMAL(5,2),
    "tx_observacao" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_pt_item_endo" INTEGER NOT NULL,
    CONSTRAINT "pt_endo_canal_endo_fkey" FOREIGN KEY ("id_pt_item_endo") REFERENCES "pt_item_endo"("id_pt_item_endo")
  )`,

  `CREATE TABLE IF NOT EXISTS "reserva" (
    "id_reserva" SERIAL PRIMARY KEY,
    "id_agenda" INTEGER,
    "id_paciente" INTEGER,
    "id_prestador" INTEGER,
    "dt_data" TIMESTAMP(3),
    "vl_hora_inicio" VARCHAR(5),
    "vl_hora_final" VARCHAR(5),
    "tx_observacao" TEXT,
    "cd_status" VARCHAR(30),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "reserva_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "aviso" (
    "id_aviso" SERIAL PRIMARY KEY,
    "tx_titulo" VARCHAR(200),
    "tx_mensagem" TEXT,
    "cd_tipo" VARCHAR(50),
    "cd_prioridade" VARCHAR(20),
    "dt_inicio" TIMESTAMP(3),
    "dt_fim" TIMESTAMP(3),
    "id_destinatario" INTEGER,
    "fl_lido" BOOLEAN NOT NULL DEFAULT false,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "aviso_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "maladireta" (
    "id_maladireta" SERIAL PRIMARY KEY,
    "tx_titulo" VARCHAR(200),
    "tx_mensagem" TEXT,
    "cd_tipo_envio" VARCHAR(30),
    "id_filtro" INTEGER,
    "dt_envio" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "maladireta_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "empresa_endereco" (
    "id_empresa_endereco" SERIAL PRIMARY KEY,
    "id_tipo_endereco" INTEGER,
    "id_tipo_logradouro" INTEGER,
    "tx_cep" VARCHAR(10),
    "tx_endereco" VARCHAR(200),
    "tx_numero" VARCHAR(10),
    "tx_complemento" VARCHAR(100),
    "tx_referencia" VARCHAR(200),
    "id_uf" INTEGER,
    "id_cidade" INTEGER,
    "id_bairro" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "emp_end_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "empresa_fone" (
    "id_empresa_fone" SERIAL PRIMARY KEY,
    "id_tipo_fone" INTEGER,
    "tx_fone_ddd" VARCHAR(4),
    "tx_fone_nro" VARCHAR(20),
    "tx_fone_ram" VARCHAR(10),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "emp_fone_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "empresa_email" (
    "id_empresa_email" SERIAL PRIMARY KEY,
    "id_tipo_email" INTEGER,
    "tx_email" VARCHAR(200),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "emp_email_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "checkout_conta" (
    "id_checkout_conta" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200),
    "cd_tipo" VARCHAR(50),
    "cd_gateway" VARCHAR(50),
    "tx_chave_api" VARCHAR(500),
    "tx_chave_secreta" VARCHAR(500),
    "tx_webhook_url" VARCHAR(500),
    "id_cpagar_conta" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "checkout_conta_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "checkout_carteira" (
    "id_checkout_carteira" SERIAL PRIMARY KEY,
    "id_checkout_conta" INTEGER,
    "tx_nome" VARCHAR(200),
    "cd_bandeira" VARCHAR(50),
    "cd_tipo" VARCHAR(30),
    "vl_taxa_debito" DECIMAL(5,2),
    "vl_taxa_credito" DECIMAL(5,2),
    "vl_dias_recebimento" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "checkout_cart_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  `CREATE TABLE IF NOT EXISTS "estoque" (
    "id_estoque" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200),
    "tx_endereco" VARCHAR(200),
    "fl_padrao" BOOLEAN NOT NULL DEFAULT false,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "estoque_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── RPS (NFS-e) ──
  `CREATE TABLE IF NOT EXISTS "rps" (
    "id_rps" SERIAL PRIMARY KEY,
    "id_emitente" INTEGER,
    "id_creceber_cr" INTEGER,
    "tx_numero_rps" VARCHAR(50),
    "nr_numero_rps" INTEGER,
    "tx_nr_nfe" VARCHAR(50),
    "dt_emissao" TIMESTAMP(3),
    "tx_pre_razao_social" VARCHAR(200),
    "tx_pre_cnpj" VARCHAR(18),
    "tx_tom_razao_social" VARCHAR(200),
    "tx_tom_cnpj" VARCHAR(18),
    "tx_tom_email" VARCHAR(200),
    "tx_descricao_servico" TEXT,
    "vl_valor_pis" DECIMAL(12,2),
    "vl_valor_cofins" DECIMAL(12,2),
    "vl_valor_csll" DECIMAL(12,2),
    "vl_valor_irpj" DECIMAL(12,2),
    "vl_valor_inss" DECIMAL(12,2),
    "vl_total_deducao" DECIMAL(12,2),
    "vl_base_calculo" DECIMAL(12,2),
    "vl_aliquota_iss" DECIMAL(5,2),
    "vl_valor_iss" DECIMAL(12,2),
    "vl_valor_bruto" DECIMAL(12,2),
    "id_uf" INTEGER,
    "id_cidade" INTEGER,
    "id_paciente" INTEGER,
    "id_status" INTEGER,
    "id_ocorrencia" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_nfse_gateway" INTEGER,
    "id_checkout_conta" INTEGER,
    "tx_tom_ddd" VARCHAR(4),
    "tx_tom_fone" VARCHAR(20),
    "tx_tom_cep" VARCHAR(10),
    "id_tom_bairro" INTEGER,
    "id_tom_tipo_logradouro" INTEGER,
    "tx_tom_numero" VARCHAR(10),
    "url_impressao" TEXT,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "rps_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── ASSINATURA DIGITAL ──
  `CREATE TABLE IF NOT EXISTS "assinatura_digital" (
    "id_assinatura_digital" SERIAL PRIMARY KEY,
    "id_sig_operacao" INTEGER,
    "id_sig_provedor" INTEGER,
    "tx_descricao" TEXT,
    "id_status" INTEGER,
    "vl_saldo" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "assinatura_digital_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── SIG PT ITEM ──
  `CREATE TABLE IF NOT EXISTS "sig_pt_item" (
    "id_sig_pt_item" SERIAL PRIMARY KEY,
    "id_sig_log" VARCHAR(100),
    "id_pt_item" INTEGER,
    "id_pt_header" INTEGER,
    "id_paciente" INTEGER,
    "id_prestador" INTEGER,
    "tx_descricao" VARCHAR(500),
    "id_status" INTEGER,
    "dt_data" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "sig_pt_item_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── TIMELINE ──
  `CREATE TABLE IF NOT EXISTS "timeline" (
    "id_timeline" SERIAL PRIMARY KEY,
    "dt_data" TIMESTAMP(3),
    "id_item_tipo" INTEGER,
    "tx_descricao" VARCHAR(500),
    "id_formato" INTEGER,
    "tx_nome_documento" VARCHAR(200),
    "tx_nome_arquivo" VARCHAR(200),
    "id_tipo_arquivo" INTEGER,
    "vl_sequencia" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_paciente" INTEGER,
    "id_prestador" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "timeline_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── PESSOA DOCUMENTO ──
  `CREATE TABLE IF NOT EXISTS "pessoa_documento" (
    "id_pessoa_documento" SERIAL PRIMARY KEY,
    "id_paciente" INTEGER,
    "id_prestador" INTEGER,
    "tx_titulo" VARCHAR(200),
    "tx_nome_arquivo" VARCHAR(200),
    "tx_tipo_arquivo" VARCHAR(50),
    "tx_url" TEXT,
    "tx_observacao" TEXT,
    "cd_tipo" VARCHAR(30),
    "dt_data" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pessoa_documento_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── PT PARCELA TMP ──
  `CREATE TABLE IF NOT EXISTS "pt_parcela_tmp" (
    "id_pt_parcela" SERIAL PRIMARY KEY,
    "id_pt_header" INTEGER,
    "dt_vencimento" TIMESTAMP(3),
    "nr_parcela" INTEGER,
    "vl_parcela" DECIMAL(12,2),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "vl_credito" DECIMAL(12,2),
    "vl_dia_vencimento" INTEGER,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pt_parcela_tmp_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── TITULO ITEM ──
  `CREATE TABLE IF NOT EXISTS "titulo_item" (
    "id_titulo_item" SERIAL PRIMARY KEY,
    "id_titulo_lote" INTEGER,
    "id_creceber_db" INTEGER,
    "id_boleto_cedente" INTEGER,
    "tx_nosso_numero" VARCHAR(50),
    "tx_nro_documento" VARCHAR(50),
    "nr_status" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_vencimento" TIMESTAMP(3),
    "vl_debito" DECIMAL(12,2),
    "vl_tot_pagamento" DECIMAL(12,2),
    "id_gateway_cedente" INTEGER,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "titulo_item_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── PRESTADOR CONTA PREFERENCIA ──
  `CREATE TABLE IF NOT EXISTS "prestador_conta_preferencia" (
    "id_prestador_conta_pref" SERIAL PRIMARY KEY,
    "id_prestador" INTEGER,
    "tx_apresentacao" VARCHAR(200),
    "id_def_meio_envio_msg" INTEGER,
    "id_def_orcamento_modelo" INTEGER,
    "tx_def_orcamento_mensagem_impressao" TEXT,
    "fl_def_orcamento_cnpj" BOOLEAN NOT NULL DEFAULT false,
    "fl_def_orcamento_cro" BOOLEAN NOT NULL DEFAULT false,
    "id_def_modulo" INTEGER,
    "id_def_cpagar_conta" INTEGER,
    "id_def_estoque" INTEGER,
    "fl_abrir_painel_aceleradores" BOOLEAN NOT NULL DEFAULT false,
    "fl_solicitar_assinatura_digital" BOOLEAN NOT NULL DEFAULT false,
    "cd_cancelamento_nfse" VARCHAR(50),
    "vl_nfse_iss" DECIMAL(5,2),
    "vl_nfse_deducao_perc" DECIMAL(5,2),
    "vl_descr_tributos" DECIMAL(5,2),
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "prestador_conta_pref_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── RESTRICAO FINANCEIRA ──
  `CREATE TABLE IF NOT EXISTS "restricao_financeira" (
    "id_restricao_financeira" SERIAL PRIMARY KEY,
    "id_paciente" INTEGER,
    "tx_documento" VARCHAR(50),
    "tx_cpf" VARCHAR(14),
    "fl_restricao" BOOLEAN NOT NULL DEFAULT false,
    "dt_consulta" TIMESTAMP(3),
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "restricao_financeira_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── RECEBER DB PARCELA ──
  `CREATE TABLE IF NOT EXISTS "receber_db_parcela" (
    "id_receber_db_parcela" SERIAL PRIMARY KEY,
    "id_creceber_db" INTEGER,
    "dt_vencimento" TIMESTAMP(3),
    "vl_saldo" DECIMAL(12,2),
    "vl_debito" DECIMAL(12,2),
    "id_pt_header" INTEGER,
    "vl_parcela_inicio" INTEGER,
    "fl_tratamento" BOOLEAN NOT NULL DEFAULT false,
    "id_carteira_boleto" INTEGER,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "receber_db_parcela_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── PT ARCADA ANOMALIA ──
  `CREATE TABLE IF NOT EXISTS "pt_arcada_anomalia" (
    "id_pt_arcada_anomalia" SERIAL PRIMARY KEY,
    "id_pt_header" INTEGER,
    "nr_dente" INTEGER,
    "id_simbolo_anomalia" INTEGER,
    "tx_descricao" VARCHAR(200),
    "vl_bit_anomalia" INTEGER,
    "vl_bmp_anomalias" INTEGER,
    "fl_checked" BOOLEAN NOT NULL DEFAULT false,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "pt_arcada_anomalia_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── CONFIRMACAO ──
  `CREATE TABLE IF NOT EXISTS "confirmacao" (
    "id_token_confirmacao" SERIAL PRIMARY KEY,
    "cd_token_confirmacao" VARCHAR(100),
    "id_agenda_item" INTEGER,
    "dt_validade" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "tx_url_confirmacao" TEXT,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "confirmacao_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── ENVIO LOTE ──
  `CREATE TABLE IF NOT EXISTS "envio_lote" (
    "id_md_envio_lote" SERIAL PRIMARY KEY,
    "id_texto" INTEGER,
    "id_rascunho" INTEGER,
    "id_tipo_envio" INTEGER,
    "tx_assunto" VARCHAR(200),
    "vl_qtd_envios" INTEGER,
    "vl_qtd_pulo" INTEGER,
    "vl_qtd_repeticao" INTEGER,
    "id_agenda_item" INTEGER,
    "id_etiqueta" INTEGER,
    "tx_mensagem_link" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "envio_lote_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── LINK ANAMNESE ──
  `CREATE TABLE IF NOT EXISTS "link_anamnese" (
    "id_token_anamnese" SERIAL PRIMARY KEY,
    "cd_token_anamnese" VARCHAR(100),
    "id_prestador" INTEGER,
    "id_unidade_atendimento" INTEGER,
    "id_anamnese" INTEGER,
    "id_paciente" INTEGER,
    "id_tipo_envio" INTEGER,
    "tx_ddi" VARCHAR(5),
    "tx_fone_celular" VARCHAR(20),
    "tx_email" VARCHAR(200),
    "tx_mensagem" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "link_anamnese_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── EDITOR RASCUNHO ──
  `CREATE TABLE IF NOT EXISTS "editor_rascunho" (
    "id_editor_rascunho" SERIAL PRIMARY KEY,
    "tx_texto" TEXT,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "editor_rascunho_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── AGENDA ITEM CAMPO ──
  `CREATE TABLE IF NOT EXISTS "agenda_item_campo" (
    "id_agenda_item_campo" SERIAL PRIMARY KEY,
    "id_agenda" INTEGER,
    "id_campo_agenda" INTEGER,
    "vl_sequencia" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "tx_campos_json" TEXT,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "agenda_item_campo_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── DATA EXPORT ──
  `CREATE TABLE IF NOT EXISTS "dataexport" (
    "id_dataexport" SERIAL PRIMARY KEY,
    "tx_descricao" VARCHAR(200),
    "cd_formato" VARCHAR(30),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "dataexport_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── DATA EXPORT ITEM ──
  `CREATE TABLE IF NOT EXISTS "dataexport_item" (
    "id_dataexport_item" SERIAL PRIMARY KEY,
    "id_dataexport" INTEGER,
    "tx_coluna" VARCHAR(100),
    "tx_label" VARCHAR(200),
    "vl_ordem" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "dataexport_item_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── RELATORIO USUARIO ──
  `CREATE TABLE IF NOT EXISTS "usuario_relatorio" (
    "id_usuario_relatorio" SERIAL PRIMARY KEY,
    "id_relatorio" INTEGER,
    "tx_template" VARCHAR(200),
    "tx_procedure" VARCHAR(200),
    "id_relatorio_grupo" INTEGER,
    "id_tipo_relatorio" INTEGER,
    "tx_descricao" VARCHAR(200),
    "tx_icone" VARCHAR(50),
    "tx_view" VARCHAR(200),
    "fl_favorito" BOOLEAN NOT NULL DEFAULT false,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "usuario_relatorio_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── RESERVA INTEGRACAO ──
  `CREATE TABLE IF NOT EXISTS "reserva_integracao" (
    "id_reserva_integracao" SERIAL PRIMARY KEY,
    "cd_token" VARCHAR(100),
    "id_agenda" INTEGER,
    "id_prestador" INTEGER,
    "id_unidade_atendimento" INTEGER,
    "id_environment" INTEGER,
    "fl_token_publico" BOOLEAN NOT NULL DEFAULT false,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "reserva_integracao_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── CHECKOUT CARTEIRA TIPO PARCELAMENTO ──
  `CREATE TABLE IF NOT EXISTS "checkout_carteira_tipo_parcelamento" (
    "id_checkout_carteira_tipo_parc" SERIAL PRIMARY KEY,
    "id_checkout_carteira" INTEGER,
    "id_checkout_conta" INTEGER,
    "cd_checkout_tipo" VARCHAR(50),
    "cd_checkout_tipo_gateway" VARCHAR(50),
    "id_checkout_tipo_parcelamento" INTEGER,
    "vl_min_parcelas" INTEGER,
    "vl_max_parcelas" INTEGER,
    "vl_taxa_fixo" DECIMAL(12,2),
    "vl_taxa_perc" DECIMAL(5,2),
    "vl_juros_perc" DECIMAL(5,2),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "chk_cart_tipo_parc_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── CHECKOUT COBRANCA LOG ──
  `CREATE TABLE IF NOT EXISTS "checkout_cobranca_log" (
    "id_checkout_cobranca_log" SERIAL PRIMARY KEY,
    "id_checkout_cobranca" INTEGER,
    "cd_status" VARCHAR(50),
    "tx_mensagem" TEXT,
    "dt_data" TIMESTAMP(3),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "chk_cobranca_log_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── CHECKOUT COBRANCA PARCELA ──
  `CREATE TABLE IF NOT EXISTS "checkout_cobranca_parcela" (
    "id_checkout_cobranca_parcela" SERIAL PRIMARY KEY,
    "id_checkout_cobranca" INTEGER,
    "nr_parcela" INTEGER,
    "vl_valor" DECIMAL(12,2),
    "dt_vencimento" TIMESTAMP(3),
    "cd_status" VARCHAR(50),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "chk_cobranca_parcela_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── CHECKOUT TIPO PARCELAMENTO ──
  `CREATE TABLE IF NOT EXISTS "checkout_tipo_parcelamento" (
    "id_checkout_tipo_parcelamento" SERIAL PRIMARY KEY,
    "tx_nome" VARCHAR(200),
    "cd_tipo" VARCHAR(50),
    "vl_min_parcelas" INTEGER,
    "vl_max_parcelas" INTEGER,
    "vl_taxa_fixo" DECIMAL(12,2),
    "vl_taxa_perc" DECIMAL(5,2),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "chk_tipo_parc_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── CHECKOUT CONTA DOCUMENTO ──
  `CREATE TABLE IF NOT EXISTS "checkout_conta_documento" (
    "id_checkout_conta_documento" SERIAL PRIMARY KEY,
    "id_checkout_conta" INTEGER,
    "tx_nome_arquivo" VARCHAR(200),
    "tx_url" TEXT,
    "cd_tipo" VARCHAR(50),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "chk_conta_doc_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── CHECKOUT EXTRATO ──
  `CREATE TABLE IF NOT EXISTS "checkout_extrato" (
    "id_checkout_extrato" SERIAL PRIMARY KEY,
    "id_checkout_conta" INTEGER,
    "dt_data" TIMESTAMP(3),
    "vl_valor" DECIMAL(12,2),
    "cd_tipo" VARCHAR(50),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "chk_extrato_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── RESTRICAO FINANCEIRA PACIENTE ──
  `CREATE TABLE IF NOT EXISTS "restricao_financeira_paciente" (
    "id_restricao_fin_pac" SERIAL PRIMARY KEY,
    "id_paciente" INTEGER,
    "id_restricao_financeira" INTEGER,
    "tx_descricao" TEXT,
    "fl_restricao" BOOLEAN NOT NULL DEFAULT false,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "restricao_fin_pac_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── PACIENTE FOTO ──
  `CREATE TABLE IF NOT EXISTS "paciente_foto" (
    "id_paciente_foto" SERIAL PRIMARY KEY,
    "id_paciente" INTEGER,
    "tx_nome_arquivo" VARCHAR(200),
    "tx_url" TEXT,
    "cd_tipo" VARCHAR(30),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "paciente_foto_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── PRESTADOR FOTO ──
  `CREATE TABLE IF NOT EXISTS "prestador_foto" (
    "id_prestador_foto" SERIAL PRIMARY KEY,
    "id_prestador" INTEGER,
    "tx_nome_arquivo" VARCHAR(200),
    "tx_url" TEXT,
    "cd_tipo" VARCHAR(30),
    "tx_descricao" VARCHAR(200),
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "prestador_foto_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,

  // ── RPS EMITENTE ──
  `CREATE TABLE IF NOT EXISTS "rps_emitente" (
    "id_rps_emitente" SERIAL PRIMARY KEY,
    "tx_razao_social" VARCHAR(200),
    "tx_cnpj" VARCHAR(18),
    "tx_inscricao_municipal" VARCHAR(30),
    "id_nfse_gateway" INTEGER,
    "fl_ativo" BOOLEAN NOT NULL DEFAULT true,
    "id_conta" INTEGER NOT NULL,
    CONSTRAINT "rps_emitente_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id_conta")
  )`,
];

function addColumnsIfNotExist(
  table: string,
  columns: [string, string][]
): string[] {
  return columns.map(
    ([col, type]) =>
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${table}' AND column_name='${col}') THEN ALTER TABLE "${table}" ADD COLUMN "${col}" ${type}; END IF; END $$`
  );
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const reset = url.searchParams.get("reset") === "true";
    const results: string[] = [];

    if (reset) {
      const tables = MIGRATION_STATEMENTS
        .map((s) => s.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/i))
        .filter(Boolean)
        .map((m) => m![1]);
      for (const t of tables.reverse()) {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${t}" CASCADE`);
      }
      results.push("reset_all_tables");
    }

    for (const stmt of MIGRATION_STATEMENTS) {
      await prisma.$executeRawUnsafe(stmt);
      const match = stmt.match(
        /(?:CREATE (?:TABLE|TYPE|UNIQUE INDEX|INDEX).*?"(\w+)"|ALTER TABLE "(\w+)")/i
      );
      if (match) results.push(match[1] || match[2]);
    }

    // Ensure expanded columns exist on tables created before the schema was expanded
    const alterStmts = [
      ...addColumnsIfNotExist("usuario", [
        ["id_prestador", "INTEGER"],
        ["id_perfil", "INTEGER"],
        ["cd_usuario", "VARCHAR(50)"],
        ["tx_descricao", "VARCHAR(200)"],
        ["id_agenda", "INTEGER"],
        ["id_tipo_conta", "INTEGER"],
        ["id_tipo_prestador", "INTEGER"],
        ["id_prestador_conta", "INTEGER"],
        ["id_def_cpagar_conta", "INTEGER"],
        ["id_unidade_atendimento", "INTEGER"],
        ["id_def_texto_sms_agendamento", "INTEGER"],
        ["id_def_texto_receita", "INTEGER"],
        ["id_def_texto_atestado", "INTEGER"],
        ["id_def_modelo_etiqueta", "INTEGER"],
        ["id_def_modelo_orcamento", "INTEGER"],
        ["vl_qtd_unidade", "INTEGER"],
        ["vl_saldo_sms", "INTEGER"],
        ["vl_pref_doc_organizar", "VARCHAR(50)"],
        ["vl_pref_doc_tamanho", "VARCHAR(50)"],
        ["tx_ddi_local", "VARCHAR(10)"],
        ["tx_ddd_local", "VARCHAR(10)"],
        ["tx_crm_url", "VARCHAR(500)"],
        ["tx_lista_id_agenda_notify", "TEXT"],
        ["fl_reiniciar", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_bloquear", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_reiniciar_senha", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_esqueci_senha", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_admin_conta", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_desmarcar_dentes", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_remover_9_ddd31", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_notificacao", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_controle_horario", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_controle_unidade", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_controle_prestador", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_conectividade_tiss", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_sig_plataforma", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_asaas_habilitado", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_asaas", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_agenda_unidade", "BOOLEAN NOT NULL DEFAULT false"],
      ]),
      ...addColumnsIfNotExist("paciente", [
        ["tx_apelido", "VARCHAR(100)"],
        ["tx_nome_social", "VARCHAR(200)"],
        ["tx_nome_conjuge", "VARCHAR(200)"],
        ["tx_nome_mae", "VARCHAR(200)"],
        ["tx_nome_pai", "VARCHAR(200)"],
        ["id_estado_civil", "VARCHAR(20)"],
        ["id_tipo_indicacao", "VARCHAR(50)"],
        ["tx_indicacao", "VARCHAR(200)"],
        ["tx_prontuario", "VARCHAR(30)"],
        ["tx_observ", "TEXT"],
        ["id_ocupacao", "VARCHAR(50)"],
        ["id_raca", "VARCHAR(20)"],
        ["tx_codigo", "VARCHAR(50)"],
        ["id_situacao", "VARCHAR(20)"],
        ["id_status", "VARCHAR(20)"],
        ["tx_portal", "VARCHAR(255)"],
        ["tx_foto", "TEXT"],
        ["id_tipo_endereco", "VARCHAR(20)"],
        ["tx_cep", "VARCHAR(10)"],
        ["id_tipo_logradouro", "VARCHAR(10)"],
        ["tx_endereco", "VARCHAR(200)"],
        ["tx_numero", "VARCHAR(10)"],
        ["tx_complemento", "VARCHAR(50)"],
        ["tx_referencia", "VARCHAR(100)"],
        ["id_uf", "VARCHAR(2)"],
        ["id_cidade", "VARCHAR(100)"],
        ["id_bairro", "VARCHAR(100)"],
        ["id_tipo_fone1", "VARCHAR(20)"],
        ["tx_fone_ddd1", "VARCHAR(4)"],
        ["tx_fone_nro1", "VARCHAR(20)"],
        ["tx_fone_ram1", "VARCHAR(10)"],
        ["id_tipo_fone2", "VARCHAR(20)"],
        ["tx_fone_ddd2", "VARCHAR(4)"],
        ["tx_fone_nro2", "VARCHAR(20)"],
        ["tx_fone_ram2", "VARCHAR(10)"],
        ["id_tipo_fone3", "VARCHAR(20)"],
        ["tx_fone_ddd3", "VARCHAR(4)"],
        ["tx_fone_nro3", "VARCHAR(20)"],
        ["tx_fone_ram3", "VARCHAR(10)"],
        ["id_tipo_email1", "VARCHAR(20)"],
        ["tx_email1", "VARCHAR(200)"],
        ["id_tipo_email2", "VARCHAR(20)"],
        ["tx_email2", "VARCHAR(200)"],
      ]),
      ...addColumnsIfNotExist("agenda", [
        ["dt_ini_grade", "TIMESTAMP(3)"],
        ["dt_fin_grade", "TIMESTAMP(3)"],
        ["vl_duracao_padrao", "INTEGER"],
        ["vl_zoom", "INTEGER"],
        ["id_formato_agendamento", "INTEGER"],
        ["vl_def_opcao_novo_agendamento", "INTEGER"],
        ["fl_alerta_agendamento", "BOOLEAN NOT NULL DEFAULT false"],
        ["id_def_status", "INTEGER"],
        ["fl_omitir_domingo", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_omitir_sabado", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_omitir_nao_utilizados", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_notificacao_email", "BOOLEAN NOT NULL DEFAULT false"],
        ["tx_notificacao_email", "VARCHAR(200)"],
        ["fl_agendamento_simultaneo", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_elegibilidade_automatica", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_informar_procedimento_agenda", "BOOLEAN NOT NULL DEFAULT false"],
        ["id_cor", "INTEGER"],
        ["fl_autoagendamento", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_confirmacao_agendamento", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_lembrete_agendamento", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_protocolo_agendamento", "BOOLEAN NOT NULL DEFAULT false"],
        ["fl_lembrete_retorno", "BOOLEAN NOT NULL DEFAULT false"],
      ]),
      ...addColumnsIfNotExist("prestador", [
        ["tx_nome_abreviado", "VARCHAR(100)"],
        ["id_tipo_prestador", "VARCHAR(20)"],
        ["tx_cpf", "VARCHAR(14)"],
        ["tx_rg", "VARCHAR(20)"],
        ["id_conselho", "VARCHAR(10)"],
        ["tx_cro_numero", "VARCHAR(20)"],
        ["dt_nascimento", "TIMESTAMP(3)"],
        ["tx_foto", "TEXT"],
        ["tx_observ", "TEXT"],
      ]),
    ];
    for (const stmt of alterStmts) {
      await prisma.$executeRawUnsafe(stmt);
    }
    results.push("alter_columns_expanded");

    return NextResponse.json({
      success: true,
      message: "All tables and columns created/updated successfully",
      created: [...new Set(results)],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
