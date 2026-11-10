"use client";

import { useState, useEffect } from "react";

interface UserInfo {
  tx_nome: string;
  ultimo_acesso?: string;
}

function CollapsibleSection({
  title,
  count = 0,
  actions,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm text-gray-700">
            {title} ({count})
          </span>
        </div>
        {actions && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </button>
      {open && children && (
        <div className="px-5 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

export default function DashboardHome() {
  const [tab, setTab] = useState("avisos");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState({ pacientes: 0, agendamentos: 0, tratamentosAtivos: 0, receber: 0, receberCount: 0, pagar: 0, pagarCount: 0 });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setUser(data))
      .catch(() => {});

    fetch("/api/dashboard/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setStats(data))
      .catch(() => {});
  }, []);

  const tabs = [
    { key: "avisos", label: "Avisos" },
    { key: "painel", label: "Painel" },
    { key: "agenda", label: "Análise de agenda" },
    { key: "vendas", label: "Análise de vendas" },
    { key: "financeiro", label: "Análise financeira" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((t) => (
            <TabButton
              key={t.key}
              label={t.label}
              active={tab === t.key}
              onClick={() => setTab(t.key)}
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        {tab === "avisos" && (
          <div>
            {/* Welcome Card */}
            <div className="bg-white rounded border border-gray-200 mb-4">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    Olá {user?.tx_nome || "..."}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Seu último acesso foi em {user?.ultimo_acesso || new Date().toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Validade da licença: Indeterminada
                  </p>
                </div>
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="bg-white rounded border border-gray-200">
              <CollapsibleSection
                title="Mensagens e avisos para GAPO"
                count={0}
                actions={
                  <button className="text-gray-400 hover:text-primary transition-colors" title="Adicionar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                }
              />

              <CollapsibleSection
                title="Agendamentos de hoje"
                count={stats.agendamentos}
                actions={
                  <button className="text-gray-400 hover:text-primary transition-colors" title="Abrir">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                }
              />

              <CollapsibleSection title="Aniversariantes de hoje" count={0} />

              <CollapsibleSection title="Pacientes agendados ontem" count={0} />

              <CollapsibleSection
                title="Despesas com vencimento na semana"
                count={stats.pagar}
                actions={
                  <>
                    <button className="text-gray-400 hover:text-primary transition-colors" title="Abrir">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-primary transition-colors" title="Visualizar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </>
                }
              />

              <CollapsibleSection
                title="Recebimentos com vencimento na semana"
                count={stats.receber}
                actions={
                  <>
                    <button className="text-gray-400 hover:text-primary transition-colors" title="Abrir">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-primary transition-colors" title="Visualizar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </>
                }
              />

              <CollapsibleSection
                title="Retornos do mês"
                count={0}
                actions={
                  <button className="text-gray-400 hover:text-primary transition-colors" title="Abrir">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                }
              />
            </div>
          </div>
        )}

        {tab === "painel" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.pacientes}</div>
              <div className="text-xs text-gray-500 mt-1">Total de Pacientes</div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.agendamentos}</div>
              <div className="text-xs text-gray-500 mt-1">Agendamentos Hoje</div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.tratamentosAtivos}</div>
              <div className="text-xs text-gray-500 mt-1">Tratamentos Ativos</div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="text-2xl font-bold text-primary">
                {stats.receber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <div className="text-xs text-gray-500 mt-1">A Receber no Mês ({stats.receberCount})</div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-500">
                {stats.pagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <div className="text-xs text-gray-500 mt-1">A Pagar no Mês ({stats.pagarCount})</div>
            </div>
          </div>
        )}

        {tab === "agenda" && (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Análise de agenda</p>
            <p className="text-xs mt-1">Indicadores de ocupação e produtividade da agenda</p>
          </div>
        )}

        {tab === "vendas" && (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Análise de vendas</p>
            <p className="text-xs mt-1">Indicadores de orçamentos e tratamentos realizados</p>
          </div>
        )}

        {tab === "financeiro" && (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Análise financeira</p>
            <p className="text-xs mt-1">Indicadores financeiros de receitas e despesas</p>
          </div>
        )}
      </div>
    </div>
  );
}
