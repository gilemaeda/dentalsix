"use client";

import { useState, useEffect, useCallback } from "react";

interface AgendaItem {
  id_agenda_item: number;
  dt_inicio: string;
  dt_fim: string;
  tx_observacao: string | null;
  cd_status: string;
  paciente: { tx_nome: string };
  prestador: { tx_nome: string };
  agenda: { tx_descricao: string };
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  AGENDADO: { bg: "bg-blue-100", text: "text-blue-700", label: "Agendado" },
  CONFIRMADO: { bg: "bg-green-100", text: "text-green-700", label: "Confirmado" },
  ATENDIDO: { bg: "bg-gray-200", text: "text-gray-600", label: "Atendido" },
  FALTA: { bg: "bg-red-100", text: "text-red-700", label: "Falta" },
  CANCELADO: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Cancelado" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function addDays(date: string, days: number) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getWeekDays(baseDate: string) {
  const d = new Date(baseDate + "T12:00:00");
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt.toISOString().split("T")[0];
  });
}

const HORARIOS = Array.from({ length: 20 }, (_, i) => {
  const hora = Math.floor(i / 2) + 8;
  const minuto = i % 2 === 0 ? "00" : "30";
  return `${String(hora).padStart(2, "0")}:${minuto}`;
});

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaPage() {
  const [data, setData] = useState(() => new Date().toISOString().split("T")[0]);
  const [view, setView] = useState<"dia" | "semana">("dia");
  const [itens, setItens] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItens = useCallback(async () => {
    setLoading(true);
    try {
      if (view === "dia") {
        const r = await fetch(`/api/agenda?data=${data}`);
        if (r.ok) { const d = await r.json(); setItens(d.itens); }
      } else {
        const days = getWeekDays(data);
        const all = await Promise.all(
          days.map(async (d) => {
            const r = await fetch(`/api/agenda?data=${d}`);
            return r.ok ? (await r.json()).itens : [];
          })
        );
        setItens(all.flat());
      }
    } catch {} finally { setLoading(false); }
  }, [data, view]);

  useEffect(() => { fetchItens(); }, [fetchItens]);

  function getItemsForSlot(horario: string, dateStr?: string) {
    return itens.filter((item) => {
      const t = formatTime(item.dt_inicio);
      if (t !== horario) return false;
      if (dateStr) {
        const itemDate = new Date(item.dt_inicio).toISOString().split("T")[0];
        return itemDate === dateStr;
      }
      return true;
    });
  }

  const weekDays = getWeekDays(data);
  const dateLabel = new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Agenda</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded overflow-hidden border border-gray-200">
            <button onClick={() => setView("dia")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "dia" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-200"}`}>Dia</button>
            <button onClick={() => setView("semana")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "semana" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-200"}`}>Semana</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200 flex items-center gap-3">
          <button onClick={() => setData(addDays(data, view === "semana" ? -7 : -1))} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setData(new Date().toISOString().split("T")[0])} className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded hover:bg-primary/5 transition-colors">Hoje</button>
          <button onClick={() => setData(addDays(data, view === "semana" ? 7 : 1))} className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          <span className="text-xs text-gray-500 capitalize">{dateLabel}</span>
          {loading && <span className="text-xs text-gray-400 ml-auto">Carregando...</span>}
        </div>

        {view === "semana" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="w-16 px-2 py-2 text-xs font-medium text-gray-500">Hora</th>
                  {weekDays.map((d) => {
                    const dt = new Date(d + "T12:00:00");
                    const isToday = d === new Date().toISOString().split("T")[0];
                    return (
                      <th key={d} className={`px-2 py-2 text-xs font-medium ${isToday ? "text-primary bg-primary/5" : "text-gray-500"}`}>
                        {DIAS_SEMANA[dt.getDay()]} {dt.getDate()}/{dt.getMonth() + 1}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map((h) => (
                  <tr key={h} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-2 py-1 text-xs text-gray-400 font-mono text-center border-r border-gray-100">{h}</td>
                    {weekDays.map((d) => {
                      const slotItems = getItemsForSlot(h, d);
                      return (
                        <td key={d} className="px-1 py-1 border-r border-gray-50 min-h-[2rem]">
                          {slotItems.map((item) => {
                            const st = STATUS_COLORS[item.cd_status] || STATUS_COLORS.AGENDADO;
                            return (
                              <div key={item.id_agenda_item} className={`${st.bg} ${st.text} rounded px-1.5 py-0.5 text-[10px] truncate mb-0.5 cursor-pointer`} title={`${item.paciente.tx_nome} - ${item.prestador.tx_nome}`}>
                                {item.paciente.tx_nome}
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {HORARIOS.map((h) => {
              const slotItems = getItemsForSlot(h);
              return (
                <div key={h} className="flex items-stretch hover:bg-gray-50/50 transition-colors">
                  <div className="w-16 shrink-0 px-3 py-2.5 text-xs text-gray-400 font-mono border-r border-gray-100 text-center">{h}</div>
                  <div className="flex-1 px-3 py-1.5 min-h-[2.5rem] flex flex-wrap gap-1.5 items-center">
                    {slotItems.map((item) => {
                      const st = STATUS_COLORS[item.cd_status] || STATUS_COLORS.AGENDADO;
                      return (
                        <div key={item.id_agenda_item} className={`${st.bg} ${st.text} rounded-md px-2.5 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                          <span className="font-medium">{item.paciente.tx_nome}</span>
                          <span className="mx-1.5 opacity-50">|</span>
                          <span>{item.prestador.tx_nome}</span>
                          <span className="ml-1.5 opacity-60">{formatTime(item.dt_inicio)}-{formatTime(item.dt_fim)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3">
        {Object.entries(STATUS_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${val.bg}`} />
            <span className="text-[10px] text-gray-500">{val.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
