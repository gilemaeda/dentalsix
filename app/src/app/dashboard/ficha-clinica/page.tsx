"use client";

import { useState, useCallback } from "react";

interface Paciente {
  id_paciente: number;
  tx_nome: string;
  dt_nascimento: string | null;
  tx_fone_ddd1: string | null;
  tx_fone_nro1: string | null;
  id_sexo: string | null;
}

interface Tratamento {
  id_pt_header: number;
  dt_inicio: string;
  cd_situacao: string;
  prestador: { tx_nome: string };
}

type FaceColor = "" | "caries" | "restored" | "missing" | "planned";
const FACE_COLORS: Record<FaceColor, string> = {
  "": "fill-white",
  caries: "fill-red-400",
  restored: "fill-green-400",
  missing: "fill-gray-400",
  planned: "fill-yellow-300",
};
const FACE_LABELS: Record<string, string> = {
  "": "Normal", caries: "Cárie", restored: "Restaurado", missing: "Ausente", planned: "Planejado",
};

const UPPER_RIGHT = [18,17,16,15,14,13,12,11];
const UPPER_LEFT  = [21,22,23,24,25,26,27,28];
const LOWER_RIGHT = [48,47,46,45,44,43,42,41];
const LOWER_LEFT  = [31,32,33,34,35,36,37,38];

type Faces = { v: FaceColor; l: FaceColor; m: FaceColor; d: FaceColor; o: FaceColor };
type OdontoState = Record<number, Faces>;

function initOdonto(): OdontoState {
  const state: OdontoState = {};
  [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_RIGHT, ...LOWER_LEFT].forEach((t) => {
    state[t] = { v: "", l: "", m: "", d: "", o: "" };
  });
  return state;
}

function ToothSVG({ num, faces, activeTool, onFaceClick }: {
  num: number; faces: Faces; activeTool: FaceColor;
  onFaceClick: (num: number, face: keyof Faces) => void;
}) {
  const s = 36;
  const faceData: { key: keyof Faces; path: string }[] = [
    { key: "v", path: `M0,0 L${s},0 L${s*0.75},${s*0.25} L${s*0.25},${s*0.25} Z` },
    { key: "l", path: `M0,${s} L${s},${s} L${s*0.75},${s*0.75} L${s*0.25},${s*0.75} Z` },
    { key: "m", path: `M0,0 L${s*0.25},${s*0.25} L${s*0.25},${s*0.75} L0,${s} Z` },
    { key: "d", path: `M${s},0 L${s},${s} L${s*0.75},${s*0.75} L${s*0.75},${s*0.25} Z` },
    { key: "o", path: `M${s*0.25},${s*0.25} L${s*0.75},${s*0.25} L${s*0.75},${s*0.75} L${s*0.25},${s*0.75} Z` },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="cursor-pointer">
        {faceData.map(({ key, path }) => (
          <path
            key={key}
            d={path}
            className={`${FACE_COLORS[faces[key]]} stroke-gray-400 hover:opacity-70 transition-opacity`}
            strokeWidth={0.5}
            onClick={() => onFaceClick(num, key)}
          />
        ))}
      </svg>
      <span className="text-[10px] text-gray-500 mt-0.5 font-mono">{num}</span>
    </div>
  );
}

export default function FichaClinicaPage() {
  const [busca, setBusca] = useState("");
  const [results, setResults] = useState<Paciente[]>([]);
  const [searching, setSearching] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [tab, setTab] = useState<"odonto" | "tratamentos" | "receitas" | "docs" | "historico">("odonto");
  const [odonto, setOdonto] = useState<OdontoState>(initOdonto);
  const [activeTool, setActiveTool] = useState<FaceColor>("caries");
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([]);

  const searchPacientes = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const r = await fetch(`/api/pacientes?busca=${encodeURIComponent(q)}&limit=8`);
      if (r.ok) { const d = await r.json(); setResults(d.pacientes); }
    } catch {} finally { setSearching(false); }
  }, []);

  function selectPaciente(p: Paciente) {
    setPaciente(p);
    setResults([]);
    setBusca(p.tx_nome);
    setOdonto(initOdonto());
    fetch(`/api/tratamentos?busca=${encodeURIComponent(p.tx_nome)}`)
      .then(r => r.ok ? r.json() : { tratamentos: [] })
      .then(d => setTratamentos(d.tratamentos))
      .catch(() => {});
  }

  function onFaceClick(num: number, face: keyof Faces) {
    setOdonto(prev => {
      const tooth = { ...prev[num] };
      tooth[face] = tooth[face] === activeTool ? "" : activeTool;
      return { ...prev, [num]: tooth };
    });
  }

  function calcAge(dt: string | null) {
    if (!dt) return null;
    const birth = new Date(dt);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
  }

  const tabs = [
    { key: "odonto", label: "Odontograma" },
    { key: "tratamentos", label: "Tratamentos" },
    { key: "receitas", label: "Receitas" },
    { key: "docs", label: "Documentos" },
    { key: "historico", label: "Histórico" },
  ] as const;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Ficha Clínica</h1>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); searchPacientes(e.target.value); }}
          placeholder="Buscar paciente pelo nome..."
          className="w-full sm:w-96 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        {searching && <span className="absolute right-3 top-2.5 text-xs text-gray-400">Buscando...</span>}
        {results.length > 0 && (
          <div className="absolute z-20 w-full sm:w-96 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
            {results.map((p) => (
              <button key={p.id_paciente} onClick={() => selectPaciente(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0">
                <span className="font-medium text-gray-800">{p.tx_nome}</span>
                {p.tx_fone_nro1 && <span className="text-gray-400 ml-2">({p.tx_fone_ddd1}) {p.tx_fone_nro1}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {!paciente ? (
        <div className="bg-white rounded border border-gray-200 py-16 text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-sm">Selecione um paciente para visualizar a ficha clínica</p>
        </div>
      ) : (
        <>
          {/* Patient Header */}
          <div className="bg-white rounded border border-gray-200 px-4 py-3 mb-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {paciente.tx_nome.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-800">{paciente.tx_nome}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                {paciente.dt_nascimento && <span>{calcAge(paciente.dt_nascimento)} anos</span>}
                {paciente.id_sexo && <span>{paciente.id_sexo}</span>}
                {paciente.tx_fone_nro1 && <span>({paciente.tx_fone_ddd1}) {paciente.tx_fone_nro1}</span>}
              </div>
            </div>
            <button onClick={() => { setPaciente(null); setBusca(""); }} className="text-xs text-gray-400 hover:text-gray-600">Trocar paciente</button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded border border-gray-200">
            <div className="flex border-b border-gray-200">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {tab === "odonto" && (
                <div>
                  {/* Tool palette */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500 mr-1">Ferramenta:</span>
                    {(Object.keys(FACE_LABELS) as FaceColor[]).filter(k => k !== "").map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveTool(key)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors ${activeTool === key ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                      >
                        <div className={`w-3 h-3 rounded-sm ${FACE_COLORS[key]}`} />
                        {FACE_LABELS[key]}
                      </button>
                    ))}
                  </div>

                  {/* Odontograma */}
                  <div className="flex flex-col items-center gap-4">
                    {/* Upper arch */}
                    <div className="text-[10px] text-gray-400 font-medium">ARCADA SUPERIOR</div>
                    <div className="flex gap-1">
                      <div className="flex gap-1">
                        {UPPER_RIGHT.map((n) => (
                          <ToothSVG key={n} num={n} faces={odonto[n]} activeTool={activeTool} onFaceClick={onFaceClick} />
                        ))}
                      </div>
                      <div className="w-px bg-gray-300 mx-1" />
                      <div className="flex gap-1">
                        {UPPER_LEFT.map((n) => (
                          <ToothSVG key={n} num={n} faces={odonto[n]} activeTool={activeTool} onFaceClick={onFaceClick} />
                        ))}
                      </div>
                    </div>

                    <div className="w-full border-t border-dashed border-gray-300" />

                    {/* Lower arch */}
                    <div className="flex gap-1">
                      <div className="flex gap-1">
                        {LOWER_RIGHT.map((n) => (
                          <ToothSVG key={n} num={n} faces={odonto[n]} activeTool={activeTool} onFaceClick={onFaceClick} />
                        ))}
                      </div>
                      <div className="w-px bg-gray-300 mx-1" />
                      <div className="flex gap-1">
                        {LOWER_LEFT.map((n) => (
                          <ToothSVG key={n} num={n} faces={odonto[n]} activeTool={activeTool} onFaceClick={onFaceClick} />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">ARCADA INFERIOR</div>
                  </div>
                </div>
              )}

              {tab === "tratamentos" && (
                <div>
                  {tratamentos.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Nenhum tratamento encontrado</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 text-left">
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Prestador</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tratamentos.map((t) => (
                          <tr key={t.id_pt_header} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-800">{new Date(t.dt_inicio).toLocaleDateString("pt-BR")}</td>
                            <td className="px-3 py-2 text-sm text-gray-600">{t.prestador.tx_nome}</td>
                            <td className="px-3 py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.cd_situacao === "ATIVO" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{t.cd_situacao}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {tab === "receitas" && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>Receitas e prescrições do paciente</p>
                  <p className="text-xs mt-1">Em desenvolvimento</p>
                </div>
              )}

              {tab === "docs" && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>Documentos e impressos do paciente</p>
                  <p className="text-xs mt-1">Em desenvolvimento</p>
                </div>
              )}

              {tab === "historico" && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>Histórico de atendimentos e procedimentos</p>
                  <p className="text-xs mt-1">Em desenvolvimento</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
