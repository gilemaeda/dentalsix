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
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const where = {
    id_conta: payload.id_conta,
    fl_ativo: true,
    ...(busca
      ? {
          OR: [
            { tx_nome: { contains: busca, mode: "insensitive" as const } },
            { tx_cpf: { contains: busca } },
            { tx_email1: { contains: busca, mode: "insensitive" as const } },
            { tx_fone_nro1: { contains: busca } },
            { tx_prontuario: { contains: busca } },
          ],
        }
      : {}),
  };

  const [pacientes, total] = await Promise.all([
    prisma.paciente.findMany({
      where,
      orderBy: { tx_nome: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.paciente.count({ where }),
  ]);

  return NextResponse.json({ pacientes, total, page, limit });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const paciente = await prisma.paciente.create({
    data: {
      tx_nome: body.tx_nome.trim(),
      tx_apelido: body.tx_apelido || null,
      tx_nome_social: body.tx_nome_social || null,
      dt_nascimento: body.dt_nascimento ? new Date(body.dt_nascimento) : null,
      id_sexo: body.id_sexo || null,
      tx_cpf: body.tx_cpf || null,
      id_doc_tipo: body.id_doc_tipo || null,
      tx_doc_nro: body.tx_doc_nro || null,
      id_estado_civil: body.id_estado_civil || null,
      id_tipo_indicacao: body.id_tipo_indicacao || null,
      tx_indicacao: body.tx_indicacao || null,
      id_ocupacao: body.id_ocupacao || null,
      id_raca: body.id_raca || null,
      tx_nome_conjuge: body.tx_nome_conjuge || null,
      tx_nome_mae: body.tx_nome_mae || null,
      tx_nome_pai: body.tx_nome_pai || null,
      tx_prontuario: body.tx_prontuario || null,
      tx_observ: body.tx_observ || null,
      tx_codigo: body.tx_codigo || null,
      id_status: body.id_status || null,
      // Address
      tx_cep: body.tx_cep || null,
      id_tipo_logradouro: body.id_tipo_logradouro || null,
      tx_endereco: body.tx_endereco || null,
      tx_numero: body.tx_numero || null,
      tx_complemento: body.tx_complemento || null,
      tx_referencia: body.tx_referencia || null,
      id_uf: body.id_uf || null,
      id_cidade: body.id_cidade || null,
      id_bairro: body.id_bairro || null,
      // Phone 1
      id_tipo_fone1: body.id_tipo_fone1 || "Celular",
      tx_fone_ddd1: body.tx_fone_ddd1 || null,
      tx_fone_nro1: body.tx_fone_nro1 || null,
      tx_fone_ram1: body.tx_fone_ram1 || null,
      // Phone 2
      id_tipo_fone2: body.id_tipo_fone2 || null,
      tx_fone_ddd2: body.tx_fone_ddd2 || null,
      tx_fone_nro2: body.tx_fone_nro2 || null,
      tx_fone_ram2: body.tx_fone_ram2 || null,
      // Phone 3
      id_tipo_fone3: body.id_tipo_fone3 || null,
      tx_fone_ddd3: body.tx_fone_ddd3 || null,
      tx_fone_nro3: body.tx_fone_nro3 || null,
      tx_fone_ram3: body.tx_fone_ram3 || null,
      // Email 1
      id_tipo_email1: body.id_tipo_email1 || "Pessoal",
      tx_email1: body.tx_email1 || null,
      // Email 2
      id_tipo_email2: body.id_tipo_email2 || null,
      tx_email2: body.tx_email2 || null,
      // Insurance
      id_operadora: body.id_operadora || null,
      id_produto: body.id_produto || null,
      tx_matricula: body.tx_matricula || null,
      dt_validade: body.dt_validade ? new Date(body.dt_validade) : null,
      // Custom fields
      tx_campos_livres: body.tx_campos_livres || null,
      fl_publico: body.fl_publico || false,
      id_prestador_res: body.id_prestador_res || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(paciente, { status: 201 });
}
