"use client";

import { useState, useEffect, useCallback } from "react";

interface EstoqueItem {
  id_estoque_item: number;
  vl_custo_medio: string | null;
  vl_saldo: string;
  materialItem: {
    tx_nome: string;
    tx_codigo: string | null;
    id_unid_consumo: string | null;
  };
}

export default function EstoquePage() {
  const [estoqueItens, setEstoqueItens] = useState<EstoqueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/estoque?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEstoqueItens(data.estoqueItens);
        setTotal(data.total);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [busca]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  function formatMoney(val: string | null) {
    if (!val) return "—";
    return parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 4 });
  }

  function formatQty(val: string) {
    return parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Controle de Estoque</h1>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar material..."
            className="w-full sm:w-80 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Nome do item</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Unidade</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase text-right hidden md:table-cell">Cst médio</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : estoqueItens.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  <p className="text-sm">Nenhum material no estoque</p>
                </td></tr>
              ) : estoqueItens.map((e) => (
                <tr key={e.id_estoque_item} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium">{e.materialItem.tx_nome}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">{e.materialItem.tx_codigo || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">{e.materialItem.id_unid_consumo || "—"}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 text-right hidden md:table-cell">R$ {formatMoney(e.vl_custo_medio)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-800 font-medium text-right">{formatQty(e.vl_saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500">
            {total} ite{total !== 1 ? "ns" : "m"} no estoque
          </div>
        )}
      </div>
    </div>
  );
}
