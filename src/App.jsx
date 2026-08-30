import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid'; 

// =================================================================
// 0. LaTeX প্রি-প্রসেসর (ম্যাথ ফিক্স করার অরিজিনাল ইঞ্জিন)
// =================================================================
const preprocessLaTeX = (content) => {
  if (!content) return '';
  return content
    .replace(/\\\[([\s\S]*?)\\\]/g, '\n$$$$$1$$$$\n')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
};

// === NEW: DEPARTMENT SYLLABUS PDF LINK === //
const SYLLABUS_PDF_LINK = "https://drive.google.com/file/d/1BxKJIAQM-zWXJInDG2v5Cg4Do0Y9Kz1R/preview";
// ========================================= //

// === NEW: EEE DIGITAL LIBRARY MOCK DATA === //
const EEE_BOOKS = [
  { id: 1, title: "Fundamentals of Electric Circuits", author: "Alexander & Sadiku", category: "Circuits", color: "from-blue-500 to-cyan-500", icon: "⚡", link: "https://drive.google.com/file/d/1L6KlLKqCzL0z3viuKk9r-8ktEWyoJhJP/preview" },
  { id: 2, title: "Electronic Devices and Circuit Theory", author: "Robert L. Boylestad", category: "Electronics", color: "from-emerald-500 to-teal-500", icon: "🔌", link: "https://drive.google.com/file/d/1Srlh9fTgncm4dVtBQCnlwdJlUQIZeq3Z/preview" },
  { id: 3, title: "A Textbook of Electrical Technology", author: "B.L. Theraja", category: "Machines", color: "from-amber-500 to-orange-500", icon: "⚙️", link: "https://drive.google.com/file/d/1SnyLNGdxyqHAIh4Oxz77ImMHaKTMj4jj/preview" },
  { id: 4, title: "Digital Systems Principles And Applications", author: "Tocci Widmer", category: "Digital Logic", color: "from-purple-500 to-indigo-500", icon: "🎛️", link: "https://drive.google.com/file/d/188er6bjzadpJhA9IARwsMqRllQ8T2wYG/preview" },
  { id: 5, title: "Electric Machinery Fundamentals", author: "Stephen J.Chapman", category: "Energy Conversion", color: "from-red-500 to-rose-500", icon: "🗼", link: "https://drive.google.com/file/d/1BJYJFsJa__tj1lYFHd-K0Cu0tFflTcsW/preview" },
  { id: 6, title: "Principles of Electronics", author: "V.K Metha", category: "Electronics", color: "from-sky-500 to-blue-500", icon: "🔋", link: "https://drive.google.com/file/d/1nPtTTNGXa0MZ3KBaEFjju4_g0UZQ56Lo/preview" }
];
// ========================================== //

// =================================================================
// 1. ডিজিটাল লজিক গেট ও ইন্টারঅ্যাক্টিভ সিমুলেটর
// =================================================================
const LogicGateSimulator = ({ rawConfig, isDarkMode }) => {
  const parseConfig = () => {
    try {
      return JSON.parse(rawConfig);
    } catch (e) {
      const text = rawConfig.toUpperCase();
      let type = 'AND';
      if (text.includes('XOR')) type = 'XOR';
      else if (text.includes('XNOR')) type = 'XNOR';
      else if (text.includes('NAND')) type = 'NAND';
      else if (text.includes('NOR')) type = 'NOR';
      else if (text.includes('NOT')) type = 'OR';
      else if (text.includes('OR')) type = 'OR';
      else if (text.includes('HALF_ADDER') || text.includes('HALF ADDER')) type = 'HALF_ADDER';
      else if (text.includes('FULL_ADDER') || text.includes('FULL ADDER')) type = 'FULL_ADDER';
      
      return {
        type: type,
        title: `${type} Gate Interactive Simulation`,
        inputs: type === 'NOT' ? ['A'] : type === 'FULL_ADDER' ? ['A', 'B', 'Cin'] : ['A', 'B'],
        expression: `Standard ${type} Logic`
      };
    }
  };

  const config = parseConfig();
  const gateType = (config.type || 'AND').toUpperCase();

  const [inputs, setInputs] = useState(() => {
    if (gateType === 'NOT') return { A: 0 };
    if (gateType === 'FULL_ADDER') return { A: 0, B: 0, Cin: 0 };
    if (gateType === 'MUX_2TO1') return { D0: 0, D1: 1, S: 0 };
    return { A: 0, B: 0 };
  });

  const toggleInput = (key) => {
    setInputs(prev => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
  };

  const calculateOutputs = () => {
    const { A = 0, B = 0, Cin = 0, D0 = 0, D1 = 0, S = 0 } = inputs;
    switch (gateType) {
      case 'AND': return { Y: A & B };
      case 'OR': return { Y: A | B };
      case 'NOT': return { Y: A === 0 ? 1 : 0 };
      case 'NAND': return { Y: (A & B) === 1 ? 0 : 1 };
      case 'NOR': return { Y: (A | B) === 1 ? 0 : 1 };
      case 'XOR': return { Y: (A ^ B) === 1 ? 1 : 0 };
      case 'XNOR': return { Y: (A ^ B) === 0 ? 1 : 0 };
      case 'HALF_ADDER': return { Sum: A ^ B, Carry: A & B };
      case 'FULL_ADDER': {
        const Sum = A ^ B ^ Cin;
        const Cout = (A & B) | (Cin & (A ^ B));
        return { Sum, Cout };
      }
      case 'MUX_2TO1': return { Y: S === 0 ? D0 : D1 };
      default: return { Y: A & B };
    }
  };

  const outputs = calculateOutputs();

  const getTruthTable = () => {
    switch (gateType) {
      case 'NOT':
        return [
          { in: { A: 0 }, out: { Y: 1 } },
          { in: { A: 1 }, out: { Y: 0 } },
        ];
      case 'HALF_ADDER':
        return [
          { in: { A: 0, B: 0 }, out: { Sum: 0, Carry: 0 } },
          { in: { A: 0, B: 1 }, out: { Sum: 1, Carry: 0 } },
          { in: { A: 1, B: 0 }, out: { Sum: 1, Carry: 0 } },
          { in: { A: 1, B: 1 }, out: { Sum: 0, Carry: 1 } },
        ];
      case 'FULL_ADDER':
        return [
          { in: { A: 0, B: 0, Cin: 0 }, out: { Sum: 0, Cout: 0 } },
          { in: { A: 0, B: 0, Cin: 1 }, out: { Sum: 1, Cout: 0 } },
          { in: { A: 0, B: 1, Cin: 0 }, out: { Sum: 1, Cout: 0 } },
          { in: { A: 0, B: 1, Cin: 1 }, out: { Sum: 0, Cout: 1 } },
          { in: { A: 1, B: 0, Cin: 0 }, out: { Sum: 1, Cout: 0 } },
          { in: { A: 1, B: 0, Cin: 1 }, out: { Sum: 0, Cout: 1 } },
          { in: { A: 1, B: 1, Cin: 0 }, out: { Sum: 0, Cout: 1 } },
          { in: { A: 1, B: 1, Cin: 1 }, out: { Sum: 1, Cout: 1 } },
        ];
      default: {
        const calc = (a, b) => {
          if (gateType === 'AND') return a & b;
          if (gateType === 'OR') return a | b;
          if (gateType === 'NAND') return (a & b) === 1 ? 0 : 1;
          if (gateType === 'NOR') return (a | b) === 1 ? 0 : 1;
          if (gateType === 'XOR') return (a ^ b) === 1 ? 1 : 0;
          if (gateType === 'XNOR') return (a ^ b) === 0 ? 1 : 0;
          return 0;
        };
        return [
          { in: { A: 0, B: 0 }, out: { Y: calc(0, 0) } },
          { in: { A: 0, B: 1 }, out: { Y: calc(0, 1) } },
          { in: { A: 1, B: 0 }, out: { Y: calc(1, 0) } },
          { in: { A: 1, B: 1 }, out: { Y: calc(1, 1) } },
        ];
      }
    }
  };

  const truthTable = getTruthTable();
  const wireColor = (val) => val === 1 ? '#38bdf8' : '#334155';
  const wireGlow = (val) => val === 1 ? 'drop-shadow(0 0 6px rgba(56,189,248,0.8))' : 'none';

  return (
    <div className={`w-full my-6 rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${
      isDarkMode ? 'bg-[#0a0d14] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-semibold ${
        isDarkMode ? 'bg-[#111622] border-slate-800 text-cyan-300' : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🎛️</span>
          <span>ডিজিটাল লজিক সিমুলেটর: <strong className="text-cyan-400 font-mono">{gateType} GATE</strong></span>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 max-w-2xl">
          <div className="flex flex-col gap-3 min-w-[130px]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center">INPUT SWITCHES</span>
            {Object.keys(inputs).map((key) => (
              <button
                key={key}
                onClick={() => toggleInput(key)}
                className={`px-4 py-2.5 rounded-xl border font-mono font-bold text-sm flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-md ${
                  inputs[key] === 1
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)] scale-102'
                    : isDarkMode 
                      ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600' 
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400'
                }`}
              >
                <span>{key}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  inputs[key] === 1 ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {inputs[key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 flex justify-center items-center py-2">
            <svg viewBox="0 0 280 140" className="w-full max-w-[280px] h-auto overflow-visible select-none">
              {gateType === 'NOT' ? (
                <line x1="20" y1="70" x2="90" y2="70" stroke={wireColor(inputs.A)} strokeWidth="3.5" style={{ filter: wireGlow(inputs.A) }} />
              ) : gateType === 'FULL_ADDER' ? (
                <>
                  <line x1="20" y1="35" x2="85" y2="35" stroke={wireColor(inputs.A)} strokeWidth="3" style={{ filter: wireGlow(inputs.A) }} />
                  <line x1="20" y1="70" x2="85" y2="70" stroke={wireColor(inputs.B)} strokeWidth="3" style={{ filter: wireGlow(inputs.B) }} />
                  <line x1="20" y1="105" x2="85" y2="105" stroke={wireColor(inputs.Cin)} strokeWidth="3" style={{ filter: wireGlow(inputs.Cin) }} />
                </>
              ) : (
                <>
                  <line x1="20" y1="40" x2="85" y2="40" stroke={wireColor(inputs.A)} strokeWidth="3.5" style={{ filter: wireGlow(inputs.A) }} />
                  <line x1="20" y1="100" x2="85" y2="100" stroke={wireColor(inputs.B)} strokeWidth="3.5" style={{ filter: wireGlow(inputs.B) }} />
                </>
              )}

              {gateType === 'NOT' ? (
                <text x="12" y="74" fill={wireColor(inputs.A)} fontSize="12" fontWeight="bold" textAnchor="end">A={inputs.A}</text>
              ) : gateType === 'FULL_ADDER' ? (
                <>
                  <text x="12" y="39" fill={wireColor(inputs.A)} fontSize="11" fontWeight="bold" textAnchor="end">A</text>
                  <text x="12" y="74" fill={wireColor(inputs.B)} fontSize="11" fontWeight="bold" textAnchor="end">B</text>
                  <text x="12" y="109" fill={wireColor(inputs.Cin)} fontSize="11" fontWeight="bold" textAnchor="end">Cin</text>
                </>
              ) : (
                <>
                  <text x="12" y="44" fill={wireColor(inputs.A)} fontSize="12" fontWeight="bold" textAnchor="end">A={inputs.A}</text>
                  <text x="12" y="104" fill={wireColor(inputs.B)} fontSize="12" fontWeight="bold" textAnchor="end">B={inputs.B}</text>
                </>
              )}

              <g stroke="#38bdf8" strokeWidth="2.5" fill={isDarkMode ? '#0d1522' : '#f0f9ff'}>
                {gateType === 'AND' && <path d="M 85,25 L 135,25 A 45,45 0 0,1 135,115 L 85,115 Z" />}
                {gateType === 'OR' && <path d="M 80,25 Q 110,70 80,115 Q 145,115 185,70 Q 145,25 80,25 Z" />}
                {gateType === 'NOT' && (
                  <>
                    <polygon points="90,25 165,70 90,115" />
                    <circle cx="173" cy="70" r="8" fill={isDarkMode ? '#0a0d14' : '#ffffff'} stroke="#38bdf8" strokeWidth="2" />
                  </>
                )}
                {gateType === 'NAND' && (
                  <>
                    <path d="M 85,25 L 135,25 A 45,45 0 0,1 135,115 L 85,115 Z" />
                    <circle cx="188" cy="70" r="8" fill={isDarkMode ? '#0a0d14' : '#ffffff'} stroke="#38bdf8" strokeWidth="2" />
                  </>
                )}
                {gateType === 'NOR' && (
                  <>
                    <path d="M 80,25 Q 110,70 80,115 Q 145,115 185,70 Q 145,25 80,25 Z" />
                    <circle cx="193" cy="70" r="8" fill={isDarkMode ? '#0a0d14' : '#ffffff'} stroke="#38bdf8" strokeWidth="2" />
                  </>
                )}
                {gateType === 'XOR' && (
                  <>
                    <path d="M 70,25 Q 100,70 70,115" fill="none" strokeWidth="2.5" />
                    <path d="M 85,25 Q 115,70 85,115 Q 150,115 190,70 Q 150,25 85,25 Z" />
                  </>
                )}
                {gateType === 'XNOR' && (
                  <>
                    <path d="M 70,25 Q 100,70 70,115" fill="none" strokeWidth="2.5" />
                    <path d="M 85,25 Q 115,70 85,115 Q 150,115 190,70 Q 150,25 85,25 Z" />
                    <circle cx="198" cy="70" r="8" fill={isDarkMode ? '#0a0d14' : '#ffffff'} stroke="#38bdf8" strokeWidth="2" />
                  </>
                )}
                {(gateType === 'HALF_ADDER' || gateType === 'FULL_ADDER') && (
                  <>
                    <rect x="85" y="20" width="105" height="100" rx="12" />
                    <text x="137" y="65" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" stroke="none">
                      {gateType === 'HALF_ADDER' ? 'HALF' : 'FULL'}
                    </text>
                    <text x="137" y="85" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" stroke="none">
                      ADDER
                    </text>
                  </>
                )}
              </g>

              {gateType === 'HALF_ADDER' ? (
                <>
                  <line x1="190" y1="45" x2="255" y2="45" stroke={wireColor(outputs.Sum)} strokeWidth="3.5" style={{ filter: wireGlow(outputs.Sum) }} />
                  <line x1="190" y1="95" x2="255" y2="95" stroke={wireColor(outputs.Carry)} strokeWidth="3.5" style={{ filter: wireGlow(outputs.Carry) }} />
                  <text x="260" y="49" fill={wireColor(outputs.Sum)} fontSize="11" fontWeight="bold">Sum={outputs.Sum}</text>
                  <text x="260" y="99" fill={wireColor(outputs.Carry)} fontSize="11" fontWeight="bold">Carry={outputs.Carry}</text>
                </>
              ) : gateType === 'FULL_ADDER' ? (
                <>
                  <line x1="190" y1="45" x2="255" y2="45" stroke={wireColor(outputs.Sum)} strokeWidth="3.5" style={{ filter: wireGlow(outputs.Sum) }} />
                  <line x1="190" y1="95" x2="255" y2="95" stroke={wireColor(outputs.Cout)} strokeWidth="3.5" style={{ filter: wireGlow(outputs.Cout) }} />
                  <text x="260" y="49" fill={wireColor(outputs.Sum)} fontSize="11" fontWeight="bold">Sum={outputs.Sum}</text>
                  <text x="260" y="99" fill={wireColor(outputs.Cout)} fontSize="11" fontWeight="bold">Cout={outputs.Cout}</text>
                </>
              ) : (
                <>
                  <line 
                    x1={gateType === 'XNOR' ? '206' : (gateType === 'NAND' || gateType === 'NOR') ? '196' : gateType === 'NOT' ? '181' : (gateType === 'XOR' || gateType === 'OR') ? '185' : '180'} 
                    y1="70" 
                    x2="255" 
                    y2="70" 
                    stroke={wireColor(outputs.Y)} 
                    strokeWidth="3.5" 
                    style={{ filter: wireGlow(outputs.Y) }} 
                  />
                  <text x="260" y="74" fill={wireColor(outputs.Y)} fontSize="12" fontWeight="bold">Y={outputs.Y}</text>
                </>
              )}
            </svg>
          </div>

          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center">OUTPUT LED</span>
            {Object.keys(outputs).map((outKey) => {
              const isOn = outputs[outKey] === 1;
              return (
                <div key={outKey} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-800 bg-slate-900/60 w-full">
                  <div className="flex items-center justify-between w-full text-xs font-mono">
                    <span className="text-slate-400">{outKey}:</span>
                    <span className={`font-bold ${isOn ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {isOn ? 'HIGH (1)' : 'LOW (0)'}
                    </span>
                  </div>
                  <div className="relative my-1">
                    <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      isOn 
                        ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.9)] scale-110' 
                        : 'bg-slate-800 border-slate-700 shadow-inner'
                    }`}>
                      <span className={`text-[10px] font-black ${isOn ? 'text-slate-950' : 'text-slate-600'}`}>
                        {outputs[outKey]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 w-full max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5">
              <span>📊</span> লাইভ ট্রুথ টেবিল (Truth Table)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">● Active State Highlighted</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`border-b border-slate-800 ${isDarkMode ? 'bg-slate-900/80 text-cyan-400' : 'bg-slate-200 text-slate-800 border-slate-300'}`}>
                <tr>
                  {Object.keys(truthTable[0].in).map(k => (
                    <th key={k} className="p-2.5 text-center font-bold">{k}</th>
                  ))}
                  {Object.keys(truthTable[0].out).map(k => (
                    <th key={k} className="p-2.5 text-center font-bold text-emerald-500">{k} (OUT)</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-300'}`}>
                {truthTable.map((row, idx) => {
                  const isActive = Object.keys(row.in).every(k => row.in[k] === inputs[k]);
                  return (
                    <tr 
                      key={idx}
                      className={`transition-all duration-200 ${
                        isActive 
                          ? (isDarkMode ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-inner' : 'bg-cyan-100 text-cyan-700 font-bold shadow-inner')
                          : (isDarkMode ? 'text-slate-400 hover:bg-slate-900/40' : 'text-slate-900 hover:bg-slate-100')
                      }`}
                    >
                      {Object.keys(row.in).map(k => (
                        <td key={k} className="p-2 text-center">{row.in[k]}</td>
                      ))}
                      {Object.keys(row.out).map(k => (
                        <td key={k} className={`p-2 text-center font-bold ${row.out[k] === 1 ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                          {row.out[k]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 1.5 আইসি পিনআউট এক্সপ্লোরার (IC Pinout Viewer)
// =================================================================
const ICPinoutViewer = ({ rawConfig, isDarkMode }) => {
  const parseConfig = () => {
    try {
      return JSON.parse(rawConfig);
    } catch (e) {
      return { ic_name: "Unknown", pin_count: 8, pins: [] };
    }
  };

  const config = parseConfig();
  const numPins = config.pin_count || 8;
  const pinsPerSide = numPins / 2;
  const pinSpacing = 35;
  const rectHeight = (pinsPerSide + 1) * pinSpacing;
  const rectWidth = 140;
  
  const getPinData = (pinNumber) => {
    return config.pins?.find(p => parseInt(p.pin) === parseInt(pinNumber)) || { name: `PIN ${pinNumber}`, desc: '' };
  };

  return (
    <div className={`w-full my-6 rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${
      isDarkMode ? 'bg-[#0a0d14] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-semibold ${
        isDarkMode ? 'bg-[#111622] border-slate-800 text-cyan-300' : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🧲</span>
          <span>আইসি পিনআউট ডায়াগ্রাম: <strong className="text-cyan-400 font-mono">{config.ic_name}</strong></span>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col items-center">
        <div className="w-full flex justify-center mb-8 overflow-x-auto">
          <svg viewBox="-100 0 340 350" className="max-w-[400px] w-full h-auto drop-shadow-xl select-none">
            <rect x="0" y="20" width={rectWidth} height={rectHeight} rx="10" fill={isDarkMode ? "#1e293b" : "#334155"} stroke="#475569" strokeWidth="2" />
            <path d={`M ${rectWidth/2 - 15} 20 A 15 15 0 0 0 ${rectWidth/2 + 15} 20`} fill={isDarkMode ? "#0a0d14" : "#ffffff"} />
            <text x={rectWidth/2} y={rectHeight/2 + 25} fill="#94a3b8" fontSize="24" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 ${rectWidth/2} ${rectHeight/2 + 25})`}>
              {config.ic_name}
            </text>

            {Array.from({ length: pinsPerSide }).map((_, i) => {
              const pinNum = i + 1;
              const yPos = 20 + (i + 1) * pinSpacing;
              const pinData = getPinData(pinNum);
              return (
                <g key={`left-${pinNum}`}>
                  <rect x="-30" y={yPos - 6} width="30" height="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="12" y={yPos + 4} fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="monospace">{pinNum}</text>
                  <text x="-40" y={yPos + 4} fill={isDarkMode ? "#38bdf8" : "#0369a1"} fontSize="13" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                    {pinData.name}
                  </text>
                </g>
              );
            })}

            {Array.from({ length: pinsPerSide }).map((_, i) => {
              const pinNum = numPins - i;
              const yPos = 20 + (i + 1) * pinSpacing;
              const pinData = getPinData(pinNum);
              return (
                <g key={`right-${pinNum}`}>
                  <rect x={rectWidth} y={yPos - 6} width="30" height="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x={rectWidth - 12} y={yPos + 4} fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="monospace">{pinNum}</text>
                  <text x={rectWidth + 40} y={yPos + 4} fill={isDarkMode ? "#38bdf8" : "#0369a1"} fontSize="13" fontWeight="bold" textAnchor="start" fontFamily="monospace">
                    {pinData.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="w-full">
          <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
            <span>📋</span> পিন কানেকশন ও বর্ণনা
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className={`border-b ${isDarkMode ? 'bg-slate-900/80 text-slate-300 border-slate-800' : 'bg-slate-200 text-slate-800 border-slate-300'}`}>
                <tr>
                  <th className="p-3 text-center w-16">Pin</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Description & Connection</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-300 text-slate-900'}`}>
                {config.pins?.map((p, idx) => (
                  <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-900/40' : 'hover:bg-slate-100'}`}>
                    <td className="p-3 text-center font-mono font-bold text-cyan-500">{p.pin}</td>
                    <td className="p-3 font-mono font-bold">{p.name}</td>
                    <td className="p-3 text-[13.5px] leading-relaxed opacity-90">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 1.8 লাইভ কারেন্ট ফ্লো অ্যানিমেশন (Interactive Simulator)
// =================================================================
const InteractiveOhmSimulator = ({ rawConfig, isDarkMode }) => {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(10);
  
  const current = voltage / resistance;
  const animationDuration = current > 0 ? Math.max(0.1, 2 / current) : 0;

  return (
    <div className={`w-full my-6 rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${
      isDarkMode ? 'bg-[#0a0d14] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
    }`}>
      <style>{`
        @keyframes electronFlow {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .electron-path {
          stroke-dasharray: 8 32;
          animation: electronFlow linear infinite;
        }
      `}</style>
      
      <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-semibold ${
        isDarkMode ? 'bg-[#111622] border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span>লাইভ অ্যানিমেশন: <strong className="font-mono">ওহমের সূত্র (Ohm's Law)</strong></span>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col items-center">
        <div className="w-full flex justify-center mb-8">
          <svg viewBox="0 0 600 300" className="w-full max-w-[500px] h-auto select-none">
            <g transform="translate(100, 150)">
              <line x1="-20" y1="-40" x2="-20" y2="40" stroke={isDarkMode ? "#f1f5f9" : "#0f172a"} strokeWidth="4" />
              <line x1="-10" y1="-20" x2="-10" y2="20" stroke={isDarkMode ? "#f1f5f9" : "#0f172a"} strokeWidth="6" />
              <text x="-35" y="-20" fill={isDarkMode ? "#ef4444" : "#dc2626"} fontSize="20" fontWeight="bold">+</text>
              <text x="5" y="-20" fill={isDarkMode ? "#3b82f6" : "#2563eb"} fontSize="24" fontWeight="bold">-</text>
              <text x="-40" y="70" fill={isDarkMode ? "#f1f5f9" : "#0f172a"} fontSize="16" fontWeight="bold">{voltage}V</text>
            </g>

            <g transform="translate(300, 50)">
              <polyline points="-50,0 -40,-20 -20,20 0,-20 20,20 40,-20 50,0" fill="none" stroke={isDarkMode ? "#f59e0b" : "#d97706"} strokeWidth="3.5" />
              <text x="-15" y="-35" fill={isDarkMode ? "#f59e0b" : "#d97706"} fontSize="16" fontWeight="bold">{resistance}Ω</text>
            </g>

            <path d="M 80 110 L 80 50 L 250 50 M 350 50 L 520 50 L 520 250 L 90 250 L 90 190" fill="none" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="4" />

            <path d="M 80 110 L 80 50 L 250 50" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
            <path d="M 350 50 L 520 50 L 520 250 L 90 250 L 90 190" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.8" />

            {current > 0 && (
              <path 
                className="electron-path"
                d="M 80 110 L 80 50 L 250 50 M 350 50 L 520 50 L 520 250 L 90 250 L 90 190" 
                fill="none" 
                stroke="#eab308" 
                strokeWidth="6" 
                strokeLinecap="round"
                style={{ animationDuration: `${animationDuration}s` }}
              />
            )}
            
            <rect x="250" y="225" width="100" height="50" rx="8" fill={isDarkMode ? "#1e293b" : "#f1f5f9"} stroke="#eab308" strokeWidth="2" />
            <text x="300" y="248" fill="#eab308" fontSize="14" fontWeight="bold" textAnchor="middle">CURRENT (I)</text>
            <text x="300" y="268" fill={isDarkMode ? "#f1f5f9" : "#0f172a"} fontSize="16" fontWeight="bold" textAnchor="middle">{current.toFixed(2)} A</text>
          </svg>
        </div>

        <div className="w-full max-w-lg flex flex-col gap-6 p-6 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-red-400">Voltage (V)</span>
              <span className="text-slate-200 bg-slate-800 px-3 py-1 rounded-md">{voltage} V</span>
            </div>
            <input 
              type="range" min="0" max="24" step="1" 
              value={voltage} 
              onChange={(e) => setVoltage(Number(e.target.value))} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-amber-400">Resistance (R)</span>
              <span className="text-slate-200 bg-slate-800 px-3 py-1 rounded-md">{resistance} Ω</span>
            </div>
            <input 
              type="range" min="1" max="100" step="1" 
              value={resistance} 
              onChange={(e) => setResistance(Number(e.target.value))} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 2. টেক্সটবুক স্ট্যান্ডার্ড সার্কিট স্কিম্যাটিক (পারফেক্ট ড্রয়িং গ্রিড)
// =================================================================
const CircuitSchematic = ({ svgContent, isDarkMode }) => {
  const [copied, setCopied] = useState(false);

  const getCleanSvg = (raw) => {
    if (!raw) return '';
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      const firstLineEnd = cleaned.indexOf('\n');
      if (firstLineEnd !== -1) cleaned = cleaned.substring(firstLineEnd + 1);
    }
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    return cleaned.trim();
  };

  const cleanSvg = getCleanSvg(svgContent);

  const handleCopySvg = () => {
    navigator.clipboard.writeText(cleanSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sahachar-circuit-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`w-full my-6 rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${
      isDarkMode ? 'bg-[#0f141d] border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-semibold ${
        isDarkMode ? 'bg-[#18202f] border-slate-700 text-cyan-300' : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span>ইলেকট্রিক্যাল সার্কিট স্কিম্যাটিক (Textbook SVG View)</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopySvg} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer">
            {copied ? '✓ Copied' : '📋 Copy SVG'}
          </button>
          <button onClick={handleDownloadSvg} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm">
            ⬇ Download
          </button>
        </div>
      </div>

      <div className={`w-full p-8 flex justify-center items-center overflow-x-auto relative ${isDarkMode ? 'circuit-grid-dark' : 'circuit-grid-light'}`}>
        <style>{`
          .circuit-grid-dark {
            background-color: #05080e;
            background-image: radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px);
            background-size: 20px 20px;
          }
          .circuit-grid-light {
            background-color: #fcfdfe;
            background-image: radial-gradient(rgba(100, 116, 139, 0.2) 1px, transparent 1px);
            background-size: 20px 20px;
          }
          .circuit-svg-wrapper svg {
            width: 100% !important;
            height: auto !important;
            min-width: 600px;
            overflow: visible !important;
            display: block;
            margin: auto;
          }
          .circuit-svg-wrapper text {
            font-family: 'Inter', sans-serif !important;
            font-weight: 600;
          }
          /* FIX: Auto-color SVG elements based on mode */
          .circuit-grid-dark .circuit-svg-wrapper svg path,
          .circuit-grid-dark .circuit-svg-wrapper svg line,
          .circuit-grid-dark .circuit-svg-wrapper svg polyline,
          .circuit-grid-dark .circuit-svg-wrapper svg rect,
          .circuit-grid-dark .circuit-svg-wrapper svg circle {
            stroke: #38bdf8 !important; /* Cyan glow for lines */
          }
          .circuit-grid-dark .circuit-svg-wrapper svg text {
            fill: #f8fafc !important; /* White text for dark mode */
          }
        `}</style>
        <div className="circuit-svg-wrapper w-full max-w-4xl flex justify-center" dangerouslySetInnerHTML={{ __html: cleanSvg }} />
      </div>
    </div>
  );
};

// =================================================================
// 3. নতুন "Electrical Blue Vibe" বুট-স্প্ল্যাশ এনিমেশন
// =================================================================
const CircuitBootSplash = ({ onComplete }) => {
  const [bootStep, setBootStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setBootStep(1), 100);  
    const t2 = setTimeout(() => setBootStep(2), 1200); 
    const t3 = setTimeout(() => setBootStep(3), 2500); 
    const t4 = setTimeout(() => setIsFadingOut(true), 6000); 
    const t5 = setTimeout(() => onComplete(), 6800); 

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none transition-opacity duration-700 ${
      isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
    }`} style={{
      background: 'radial-gradient(ellipse at center, #0ea5e9 0%, #0369a1 40%, #082f49 100%)'
    }}>
      <style>{`
        .draw-path {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: drawIn 2.5s ease-out forwards;
        }
        .draw-path-fast {
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: drawIn 1.5s ease-out forwards;
        }
        @keyframes drawIn {
          to { stroke-dashoffset: 0; }
        }
        .text-pop {
          animation: popIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        @keyframes popIn {
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .float-icon {
          animation: floatUp 6s ease-in-out infinite alternate;
        }
        @keyframes floatUp {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-15px); }
        }
      `}</style>

      <svg viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="super-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" className="float-icon">
          <path d="M 200 150 q 15 -30 30 0 q 15 -30 30 0 q 15 -30 30 0" />
          <rect x="1300" y="150" width="80" height="80" rx="8" />
          <path d="M 1280 170 h 20 M 1280 190 h 20 M 1280 210 h 20" />
          <path d="M 1380 170 h 20 M 1380 190 h 20 M 1380 210 h 20" />
          <path d="M 300 650 v 60 c 40 0, 40 -60, 0 -60" />
          <line x1="280" y1="665" x2="300" y2="665" />
          <line x1="280" y1="695" x2="300" y2="695" />
          <line x1="1200" y1="600" x2="1200" y2="650" />
          <line x1="1180" y1="650" x2="1220" y2="650" />
          <line x1="1180" y1="670" x2="1220" y2="670" />
          <line x1="1200" y1="670" x2="1200" y2="720" />
        </g>

        <g stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none">
          <path className="draw-path" d="M 0 200 h 200 l 50 50 h 100" />
          <circle cx="350" cy="250" r="6" fill="rgba(255,255,255,0.4)" />
          <path className="draw-path" d="M 0 350 h 150 l 50 -50 h 150" />
          <circle cx="350" cy="300" r="4" fill="rgba(255,255,255,0.4)" />
          <path className="draw-path" d="M 0 600 h 250 l 50 -50 h 50" />
        </g>

        <g stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none">
          <path className="draw-path" d="M 1600 250 h -200 l -50 50 h -100" />
          <circle cx="1250" cy="300" r="6" fill="rgba(255,255,255,0.4)" />
          <path className="draw-path" d="M 1600 450 h -150 l -50 -50 h -150" />
          <path className="draw-path" d="M 1600 700 h -250 l -50 -50 h -50" />
        </g>

        <line x1="0" y1="400" x2="1600" y2="400" stroke="rgba(255,255,255,0.8)" strokeWidth="3" filter="url(#super-glow)" />

        <path className="draw-path" d="M 0 400 Q 200 100, 400 400 T 800 400 T 1200 400 T 1600 400" stroke="white" strokeWidth="3" fill="none" filter="url(#super-glow)" />
        <path className="draw-path" d="M 0 400 Q 200 700, 400 400 T 800 400 T 1200 400 T 1600 400" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />

        <g stroke="white" strokeWidth="3" filter="url(#super-glow)">
          <line className="draw-path-fast" x1="450" y1="350" x2="450" y2="450" />
          <line className="draw-path-fast" x1="470" y1="280" x2="470" y2="520" />
          <line className="draw-path-fast" x1="490" y1="150" x2="490" y2="650" />
          <line className="draw-path-fast" x1="510" y1="250" x2="510" y2="550" />
          <line className="draw-path-fast" x1="530" y1="360" x2="530" y2="440" />
        </g>

        <g stroke="white" strokeWidth="3" filter="url(#super-glow)">
          <line className="draw-path-fast" x1="1050" y1="350" x2="1050" y2="450" />
          <line className="draw-path-fast" x1="1070" y1="250" x2="1070" y2="550" />
          <line className="draw-path-fast" x1="1090" y1="150" x2="1090" y2="650" />
          <line className="draw-path-fast" x1="1110" y1="280" x2="1110" y2="520" />
          <line className="draw-path-fast" x1="1130" y1="370" x2="1130" y2="430" />
        </g>
      </svg>

      {bootStep >= 3 && (
        <div className="z-10 flex flex-col items-center text-pop relative">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-white" 
              style={{ textShadow: '0px 0px 20px rgba(255,255,255,0.9), 0px 0px 40px #0284c7, 0px 0px 60px #0284c7' }}>
            SAHACHAR
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="h-[2px] w-16 md:w-24 bg-gradient-to-r from-transparent to-white"></span>
            <span className="text-2xl md:text-3xl font-bold text-white tracking-[0.4em] font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">সহচর</span>
            <span className="h-[2px] w-16 md:w-24 bg-gradient-to-l from-transparent to-white"></span>
          </div>
        </div>
      )}

      <button onClick={onComplete} className="absolute bottom-8 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer tracking-widest px-4 py-2 rounded-lg hover:bg-black/30 backdrop-blur-md z-20 border border-transparent hover:border-white/20">
        SKIP INTRO →
      </button>
    </div>
  );
};


// =================================================================
// 4. প্রিমিয়াম EEE ল্যান্ডিং স্ক্রিন
// =================================================================
const PremiumEEEIntro = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#06080e] relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden select-none font-sans text-slate-100 animate-fade-in">
      <style>{`
        @keyframes waveOscillate { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -120; } }
        .oscilloscope-wave-anim { stroke-dasharray: 8 4; animation: waveOscillate 3.5s linear infinite; }
        .shimmer-text-effect { background: linear-gradient(90deg, #38bdf8 0%, #ffffff 45%, #818cf8 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes fadeInScreen { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeInScreen 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none opacity-[0.14]" style={{
        backgroundImage: `radial-gradient(circle at center, transparent 25%, rgba(56, 189, 248, 0.08) 70%), radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 28px 28px'
      }} />

      <div className="absolute w-[620px] h-[620px] border border-cyan-500/10 rounded-full pointer-events-none flex items-center justify-center">
        <div className="w-[440px] h-[440px] border border-dashed border-blue-500/10 rounded-full flex items-center justify-center">
          <div className="w-[260px] h-[260px] border border-cyan-500/10 rounded-full" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md text-[11px] md:text-xs font-mono tracking-widest text-cyan-400 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>SYSTEM ONLINE • 220V / 50Hz • EEE INTELLIGENCE CORE</span>
        </div>

        <div className="relative my-1">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight font-sans shimmer-text-effect drop-shadow-sm">
            SAHACHAR
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1.5">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-400"></span>
            <span className="text-xl md:text-2xl font-bold tracking-[0.25em] text-cyan-400 font-sans">সহচর</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-400"></span>
          </div>
        </div>

        <p className="text-slate-400 text-sm md:text-base font-normal tracking-wide max-w-lg mx-auto mt-4 mb-9 leading-relaxed">
          The Next-Gen AI Circuit Simulator & Engineering Partner Designed Exclusively for <span className="text-cyan-300 font-medium">EEE Students</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-9 text-left">
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#0d121c]/80 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold"><span>⚡</span> Real Schematics</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">IEEE/IEC</span>
            </div>
            <div className="h-16 bg-[#070a0f] rounded-xl border border-slate-800/80 flex items-center justify-center p-2">
              <svg viewBox="0 0 160 50" className="w-full h-full stroke-cyan-400 fill-none" strokeWidth="1.8">
                <polygon points="50,10 50,40 85,25" fill="rgba(6,182,212,0.1)" />
                <line x1="20" y1="20" x2="50" y2="20" />
                <line x1="20" y1="30" x2="50" y2="30" />
                <line x1="85" y1="25" x2="140" y2="25" />
                <circle cx="20" cy="20" r="2" fill="#38bdf8" />
                <circle cx="140" cy="25" r="2" fill="#38bdf8" />
                <text x="56" y="22" fill="#94a3b8" fontSize="8" stroke="none">-</text>
                <text x="56" y="34" fill="#94a3b8" fontSize="8" stroke="none">+</text>
              </svg>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">বইয়ের মতো নিখুঁত ভেক্টর সার্কিট স্কিম্যাটিক জেনারেটর.</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#0d121c]/80 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold"><span>🎛️</span> Logic Simulator</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">Interactive</span>
            </div>
            <div className="h-16 bg-[#070a0f] rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden relative">
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-300">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400">A=1</span>
                <span>⊕</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800">B=0</span>
                <span>=</span>
                <span className="text-emerald-400 font-bold">LED ON</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">লাইভ সুইচ, গেট ড্রয়িং ও ডায়নামিক ট্রুথ টেবিল সিমুলেটর.</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-[#0d121c]/80 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold"><span>🧠</span> Reasoning Core</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">LaTeX</span>
            </div>
            <div className="h-16 bg-[#070a0f] rounded-xl border border-slate-800/80 flex items-center justify-center px-2 font-mono text-xs text-cyan-300">
              <span>V_o = -(R_f / R_in) · V_i</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">স্টেপ-বাই-স্টেপ গাণিতিক সমীকরণ ও নোডাল অ্যানালাইসিস.</p>
          </div>
        </div>

        <button onClick={onStart} className="group relative px-10 py-4.5 rounded-2xl font-bold text-base text-white transition-all duration-300 cursor-pointer border border-cyan-400/40 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:-translate-y-0.5 active:translate-y-0">
          <div className="flex items-center gap-3">
            <span>Launch Workspace</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform duration-300 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

// =================================================================
// 5. Mermaid ডায়াগ্রাম কম্পোনেন্ট
// =================================================================
const MermaidDiagram = ({ chart, isDarkMode }) => {
  const [svgStr, setSvgStr] = useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'default',
      themeVariables: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        primaryColor: isDarkMode ? '#2563eb' : '#eff6ff',
        primaryBorderColor: '#3b82f6',
      },
      flowchart: { htmlLabels: true, padding: 20, nodeSpacing: 50, rankSpacing: 50 },
      securityLevel: 'loose',
    });

    const renderMermaid = async () => {
      try {
        const id = `mermaid-${Math.round(Math.random() * 1000000)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvgStr(svg);
      } catch (error) {
        console.error("Mermaid rendering failed:", error);
        setSvgStr('<div class="p-4 bg-red-500/10 text-red-500 rounded-lg text-sm border border-red-500/20">⚠️ ডায়াগ্রামটি তৈরি করতে সমস্যা হয়েছে।</div>');
      }
    };
    renderMermaid();
  }, [chart, isDarkMode]);

  return (
    <div className={`w-full overflow-x-auto my-6 p-6 rounded-2xl border flex justify-center ${isDarkMode ? 'bg-[#1e293b]/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
      <style>{`
        .mermaid-svg-container foreignObject { overflow: visible !important; }
        .mermaid-svg-container .nodeLabel { white-space: pre-wrap !important; line-height: 1.4; }
      `}</style>
      <div className="mermaid-svg-container min-w-max" dangerouslySetInnerHTML={{ __html: svgStr }} />
    </div>
  );
};

// =================================================================
// 6. Reasoning / Thinking Process Accordion
// =================================================================
const ThinkingAccordion = ({ thought, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!thought) return null;

  return (
    <div className={`mb-5 border rounded-2xl overflow-hidden transition-all duration-300 ${
      isDarkMode ? 'bg-[#181a1f]/80 border-slate-800' : 'bg-slate-100/70 border-slate-200'
    }`}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full px-4 py-3 flex items-center justify-between text-left text-xs md:text-sm font-medium transition-colors cursor-pointer ${
        isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="font-semibold tracking-wide flex items-center gap-1.5">
            <span>🧠</span> সার্কিট ও গাণিতিক বিশ্লেষণ (Thinking Process)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] opacity-70">{isOpen ? 'লুকান' : 'দেখুন'}</span>
          <svg className={`w-4 h-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className={`px-5 py-4 border-t text-xs md:text-sm leading-relaxed transition-all ${
          isDarkMode ? 'border-slate-800/80 text-slate-300 bg-[#121316]/90 prose-invert' : 'border-slate-200 text-slate-700 bg-white'
        }`}>
          <div className="prose max-w-none text-xs md:text-sm">
            <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{preprocessLaTeX(thought)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

const parseThoughtAndContent = (fullText) => {
  if (!fullText) return { thought: null, content: '' };
  const thoughtMatch = fullText.match(/<thought>([\s\S]*?)<\/thought>/i);
  if (thoughtMatch) {
    const thought = thoughtMatch[1].trim();
    const content = fullText.replace(/<thought>[\s\S]*?<\/thought>/i, '').trim();
    return { thought, content };
  }
  return { thought: null, content: fullText };
};

// =================================================================
// 7. মেইন অ্যাপ কম্পোনেন্ট (FULL SAHACHAR ENGINE)
// =================================================================
function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [rateLimitTimer, setRateLimitTimer] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // ================= VIRTUAL LAB EXPLORER STATE =================
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customLabs, setCustomLabs] = useState(() => {
    const saved = localStorage.getItem('sahachar_custom_labs');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeLab, setActiveLab] = useState(null);
  const [isLabFullscreen, setIsLabFullscreen] = useState(false);
  const labFileInputRef = useRef(null);
  const labViewerRef = useRef(null); // Native Fullscreen Ref

  // === ACCORDION STATE FOR VIRTUAL LAB === //
  const [isLabAccordionOpen, setIsLabAccordionOpen] = useState(false);

  // === EEE DIGITAL LIBRARY STATE === //
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('All');
  const libraryCategories = ["All", ...Array.from(new Set(EEE_BOOKS.map(b => b.category)))];

  // === DEPARTMENT SYLLABUS STATE === //
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isSyllabusFullscreen, setIsSyllabusFullscreen] = useState(false);
  const syllabusViewerRef = useRef(null); // Native Fullscreen Ref

  // === ABOUT PROJECT STATE === //
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  // ================================== //

  // ================= NATIVE FULLSCREEN EFFECT ================= //
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsLabFullscreen(false);
        setIsSyllabusFullscreen(false);
      } else {
        if (document.fullscreenElement === labViewerRef.current) setIsLabFullscreen(true);
        if (document.fullscreenElement === syllabusViewerRef.current) setIsSyllabusFullscreen(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleNativeFullscreen = (ref, isFull, setIsFull) => {
    if (!document.fullscreenElement) {
      if (ref.current?.requestFullscreen) {
        ref.current.requestFullscreen().catch(err => console.log(err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  // ========================================================== //

  const getKeys = (provider) => {
    if (provider === 'groq') {
      const local = localStorage.getItem('sahachar_groq_api_keys');
      if (local) return local.split(',').map(k => k.replace(/["';`\r\n\t]/g, '').trim()).filter(Boolean);
      const envKey = import.meta.env.VITE_GROQ_API_KEYS || import.meta.env.VITE_GROQ_API_KEY;
      return envKey ? envKey.split(',').map(k => k.replace(/["';`\r\n\t]/g, '').trim()).filter(Boolean) : [];
    } else {
      const local = localStorage.getItem('sahachar_gemini_api_keys');
      if (local) return local.split(',').map(k => k.replace(/["';`\r\n\t]/g, '').trim()).filter(Boolean);
      const envKey = import.meta.env.VITE_GEMINI_API_KEYS || import.meta.env.VITE_GEMINI_API_KEY;
      return envKey ? envKey.split(',').map(k => k.replace(/["';`\r\n\t]/g, '').trim()).filter(Boolean) : [];
    }
  };

  const handleSaveKeys = () => {
    if (geminiKeyInput.trim()) localStorage.setItem('sahachar_gemini_api_keys', geminiKeyInput.trim());
    if (groqKeyInput.trim()) localStorage.setItem('sahachar_groq_api_keys', groqKeyInput.trim());
    setIsKeyModalOpen(false);
    alert('✅ API Keys সফলভাবে সেভ করা হয়েছে!');
  };

  const handleLabUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const newLab = {
        id: Date.now(),
        name: file.name.replace('.html', ''),
        content: event.target.result
      };
      const updatedLabs = [...customLabs, newLab];
      setCustomLabs(updatedLabs);
      localStorage.setItem('sahachar_custom_labs', JSON.stringify(updatedLabs));
      alert(`✅ "${newLab.name}" ল্যাব সফলভাবে যুক্ত হয়েছে!`);
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const deleteLab = (id, e) => {
    e.stopPropagation();
    if(window.confirm("ল্যাবটি ডিলিট করতে চান?")) {
      const updatedLabs = customLabs.filter(lab => lab.id !== id);
      setCustomLabs(updatedLabs);
      localStorage.setItem('sahachar_custom_labs', JSON.stringify(updatedLabs));
    }
  };

  const suggestedQuestions = [
    "ওহমের সূত্র এবং কারেন্ট ফ্লো এর অ্যানিমেশন দেখাও",
    "IC 555 Timer এর পিনআউট ডায়াগ্রাম ও বর্ণনা দাও",
    "Full Adder সার্কিটের সম্পূর্ণ সমাধান ও ট্রুথ টেবিল দেখাও",
    "Op-Amp Inverting Amplifier এর সার্কিট ও গেইন ডেরিভেশন"
  ];

  useEffect(() => {
    let interval = null;
    if (rateLimitTimer !== null && rateLimitTimer > 0) {
      interval = setInterval(() => {
        setRateLimitTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitTimer]);

  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = 'Hello Sir, Good Evening!';
    if (hour >= 5 && hour < 12) greeting = 'Hello Sir, Good Morning!';
    else if (hour >= 12 && hour < 18) greeting = 'Hello Sir, Good Afternoon!';

    setMessages([
      {
        id: 'init-greeting',
        sender: 'ai',
        greeting: greeting,
        text: "I am SAHACHAR (সহচর), your intelligent EEE learning partner. Powered by Groq & Gemini Dual-AI Engine, আমি বইয়ের মতো নিখুঁত সার্কিট ডায়াগ্রাম, লাইভ অ্যানিমেশন এবং গাণিতিক সমীকরণ বিশ্লেষণ করতে প্রস্তুত!"
      }
    ]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, rateLimitTimer]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetSession = () => {
    setMessages([
      {
        id: 'init-greeting',
        sender: 'ai',
        greeting: "Hello Sir!",
        text: "ফ্রেশ সেশন শুরু হলো! আপনার যেকোনো EEE প্রশ্ন, অ্যানিমেশন বা লজিক গেটের সমস্যা আমাকে জিজ্ঞেস করতে পারেন।"
      }
    ]);
    setRateLimitTimer(null);
  };

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inline_data: { data: base64Data, mime_type: file.type }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (textToSend) => {
    if (rateLimitTimer !== null && rateLimitTimer > 0) return;

    const messageText = textToSend || inputText;
    if (messageText.trim() === '' && !selectedFile) return;

    const newUserMsg = { 
      id: Date.now(), 
      sender: 'user', 
      text: messageText,
      image: imagePreview,
      fileRef: selectedFile
    };
    
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputText('');
    const currentFile = selectedFile; 
    removeSelectedImage(); 
    setIsTyping(true);

    const activeKeys = getKeys(selectedProvider);

    if (activeKeys.length === 0) {
      setIsTyping(false);
      setIsKeyModalOpen(true);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: `⚠️ কোনো ${selectedProvider.toUpperCase()} API Key পাওয়া যায়নি! অনুগ্রহ করে 🔑 Key Manager এ গিয়ে কী বসান।` }]);
      return;
    }

    // FIX: ADDED STRICT SVG FORMATTING INSTRUCTION
    const systemPromptText = `You are SAHACHAR (সহচর), an expert Electrical and Electronic Engineering (EEE) AI Professor. Communicate in Bengali (বাংলা).

CRITICAL PEDAGOGICAL INSTRUCTIONS (TEXTBOOK STANDARD STRUCTURE):
Whenever explaining a topic, you MUST structure your response strictly in the following order:
1. **ভূমিকা (Introduction):** Clear 2-3 line definition.
2. **সার্কিট / ব্লক ডায়াগ্রাম (Schematic):** The SVG circuit, Logic Gate JSON, or Simulator JSON.
3. **কার্যপ্রণালী (Working Principle):** Explanation of how it works.
4. **গাণিতিক বিশ্লেষণ (Mathematical Derivation):** Step-by-step math.
5. **ট্রুথ টেবিল (Truth Table):** Markdown tables if applicable.

STRICT FORMATTING RULES:
1. **ম্যাথ এবং সমীকরণ:** Wrap inline math with $...$ and block math with $$...$$. Use $...$ inside tables.

2. **সার্কিট ডায়াগ্রাম (CRITICAL):** Output inline SVG wrapped in \`\`\`circuit ... \`\`\`. Draw neat, text-book style circuit diagrams. Always use standard symbols and STRICTLY AVOID overlapping lines or messy wiring. Keep the circuit layout clean, orthogonal, and highly readable.

3. **ডিজিটাল লজিক:** For digital gates, use \`\`\`logic ... \`\`\` block with valid JSON containing "type".

4. **আইসি পিনআউট:** Use \`\`\`ic_pinout ... \`\`\` JSON format for IC pins.

5. **ইন্টারেক্টিভ অ্যানিমেশন (LIVE SIMULATION):**
   If the user asks for a visual animation of current flow, Ohm's law, or voltage/resistance relation, you MUST output this JSON wrapped in \`\`\`simulator ... \`\`\`:
   \`\`\`simulator
   {
     "topic": "ohms_law",
     "title": "ওহমের সূত্র ও কারেন্ট ফ্লো অ্যানিমেশন"
   }
   \`\`\`

6. **Thinking Process:** Use <thought>...</thought> tags before giving the final Bengali explanation.`;

    const conversationMessages = updatedMessages.filter(m => m.id !== 'init-greeting');
    const recentMessages = conversationMessages.slice(-6);

    try {
      let aiReplyText = "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।";
      let success = false;
      let lastErrorMessage = '';

      if (selectedProvider === 'groq') {
        const groqMessages = [
          { role: 'system', content: systemPromptText },
          ...recentMessages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        ];

        const GROQ_VERIFIED_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-3.1-8b-instant'];

        for (const currentApiKey of activeKeys) {
          if (success) break;

          for (const modelName of GROQ_VERIFIED_MODELS) {
            try {
              const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${currentApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: modelName,
                  messages: groqMessages,
                  temperature: 0.2,
                  max_tokens: 3500
                })
              });

              const data = await response.json();
              
              if (!response.ok || data.error) {
                lastErrorMessage = data?.error?.message || `HTTP ${response.status} Error`;
                continue;
              }

              if (data.choices && data.choices[0]?.message?.content) {
                aiReplyText = data.choices[0].message.content;
                success = true;
                break;
              }
            } catch (e) {
              console.error(`Groq error on model ${modelName}:`, e);
              lastErrorMessage = e.message;
            }
          }
        }
      } 
      else {
        const formattedContents = [];
        for (const msg of recentMessages) {
          const role = msg.sender === 'user' ? 'user' : 'model';
          const parts = [];
          if (msg.text) parts.push({ text: msg.text });
          if (msg.fileRef) {
            const imagePart = await fileToGenerativePart(msg.fileRef);
            parts.push(imagePart);
          }
          if (parts.length > 0) formattedContents.push({ role, parts });
        }

        for (const currentApiKey of activeKeys) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${currentApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: systemPromptText }] },
                  contents: formattedContents
                })
              }
            );

            const data = await response.json();
            if (data.error) {
              lastErrorMessage = data.error.message || '';
              continue;
            }

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
              aiReplyText = data.candidates[0].content.parts[0].text;
              success = true;
              break;
            }
          } catch (e) {
            console.error('Gemini fetch error:', e);
          }
        }
      }

      setIsTyping(false);

      if (success) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiReplyText }]);
      } else {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: `⚠️ সমস্যা হয়েছে (${selectedProvider.toUpperCase()}): ${lastErrorMessage || 'API রিকোয়েস্টে ত্রুটি।'}` }]);
      }

    } catch (error) {
      console.error("API Fetch Error:", error);
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: "ইন্টারনেট সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।" }]);
    }
  };

  if (isBooting) {
    return <CircuitBootSplash onComplete={() => setIsBooting(false)} />;
  }

  if (!isChatOpen) {
    return <PremiumEEEIntro onStart={() => setIsChatOpen(true)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#131314] text-slate-100' : 'bg-[#f0f4f9] text-slate-900'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* 🚀 CSS FOR PERFECT MATH & TABLES */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .katex-display { margin: 1.5em 0 !important; overflow-x: auto; overflow-y: hidden; text-align: center; }
        .katex { font-size: 1.15em !important; font-family: KaTeX_Math, 'Times New Roman', serif; }
        
        /* FIX: Better Table Colors for Light & Dark Mode */
        table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95em; }
        th { background: ${isDarkMode ? '#1e293b' : '#cbd5e1'}; color: ${isDarkMode ? '#38bdf8' : '#0f172a'}; padding: 12px; border: 1px solid ${isDarkMode ? '#334155' : '#94a3b8'}; font-weight: bold; }
        td { padding: 10px; border: 1px solid ${isDarkMode ? '#334155' : '#94a3b8'}; text-align: center; color: ${isDarkMode ? '#e2e8f0' : '#0f172a'}; }
        
        .circuit-grid-dark { background-color: #05080e; background-image: radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px); background-size: 20px 20px; }
        .circuit-grid-light { background-color: #fcfdfe; background-image: radial-gradient(rgba(100, 116, 139, 0.2) 1px, transparent 1px); background-size: 20px 20px; }
      `}</style>
      
      {/* ================= VIRTUAL LAB SIDEBAR ================= */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <div className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-[#0f141d] border-r border-slate-800' : 'bg-white border-r border-slate-200'}`}>
        <div className="p-5 border-b border-slate-800/50 flex justify-between items-center">
          <h3 className="font-bold text-cyan-400 flex items-center gap-2">
            <span>⚙️</span> Control Panel
          </h3>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          
          {/* 1. DEPARTMENT SYLLABUS BUTTON */}
          <button
            onClick={() => { setIsSyllabusOpen(true); setIsSidebarOpen(false); }}
            className={`w-full p-3.5 rounded-xl border flex items-center gap-3 transition-all duration-300 group shadow-md ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400' : 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300'}`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📜</span>
            <span className={`text-sm font-bold tracking-wide ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>Department Syllabus</span>
          </button>

          {/* 2. EEE DIGITAL LIBRARY BUTTON */}
          <button
            onClick={() => { setIsLibraryOpen(true); setIsSidebarOpen(false); }}
            className={`w-full p-3.5 rounded-xl border flex items-center gap-3 transition-all duration-300 group shadow-md ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'}`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📚</span>
            <span className={`text-sm font-bold tracking-wide ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>EEE Digital Library</span>
          </button>

          {/* 3. VIRTUAL LAB ACCORDION BUTTON */}
          <button
            onClick={() => setIsLabAccordionOpen(!isLabAccordionOpen)}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 group shadow-md ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400' : 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl group-hover:scale-110 transition-transform">🧰</span>
              <span className={`text-sm font-bold tracking-wide ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Virtual Lab</span>
            </div>
            <svg className={`w-4 h-4 transform transition-transform duration-300 ${isLabAccordionOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* VIRTUAL LAB ACCORDION CONTENT */}
          {isLabAccordionOpen && (
            <div className="flex flex-col gap-2 pl-2 border-l-2 border-slate-700/50 ml-4 animate-fade-in">
              {customLabs.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-4">
                  কোনো ল্যাব আপলোড করা নেই।
                </div>
              ) : (
                customLabs.map((lab) => (
                  <div key={lab.id} onClick={() => { setActiveLab(lab); setIsSidebarOpen(false); setIsLabFullscreen(false); }} className={`p-2.5 rounded-lg border cursor-pointer group flex justify-between items-center transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                    <span className="text-xs font-medium text-slate-200 truncate pr-2">⚡ {lab.name}</span>
                    <button onClick={(e) => deleteLab(lab.id, e)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                    </button>
                  </div>
                ))
              )}
              
              <div className="mt-2">
                <input type="file" accept=".html" ref={labFileInputRef} onChange={handleLabUpload} className="hidden" />
                <button onClick={() => labFileInputRef.current.click()} className="w-full py-2.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30 font-bold text-xs transition-all shadow-sm">
                  ➕ Upload Custom Lab
                </button>
              </div>
            </div>
          )}

          {/* === 4. ABOUT PROJECT BUTTON === */}
          <div className="mt-auto pt-4 border-t border-slate-800/50">
            <button
              onClick={() => { setIsAboutOpen(true); setIsSidebarOpen(false); }}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 group shadow-md ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-cyan-500/20 hover:border-cyan-400' : 'bg-slate-100 border-slate-300 hover:bg-cyan-50 hover:border-cyan-300'}`}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">ℹ️</span>
              <span className={`text-sm font-bold tracking-wide ${isDarkMode ? 'text-slate-300 group-hover:text-cyan-300' : 'text-slate-700 group-hover:text-cyan-700'}`}>About Project</span>
            </button>
          </div>
          {/* ======================================= */}
        </div>
      </div>

      {/* ================= NATIVE FULLSCREEN IFRAME VIEWER MODAL ================= */}
      {activeLab && (
        <div ref={labViewerRef} className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in ${isLabFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
          <div className={`bg-[#0f141d] flex flex-col overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all duration-300 ${isLabFullscreen ? 'w-full h-full rounded-none border-none max-w-none' : 'rounded-2xl w-full max-w-5xl h-[90vh]'}`}>
            <div className="p-4 border-b border-slate-800 bg-[#151b26] flex justify-between items-center">
              <h3 className="text-cyan-400 font-bold flex items-center gap-2 text-sm md:text-base">
                <span>⚡</span> {activeLab.name}
              </h3>
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  onClick={() => toggleNativeFullscreen(labViewerRef, isLabFullscreen, setIsLabFullscreen)} 
                  className={`px-3 py-1.5 md:py-1.5 rounded-lg border transition-colors flex items-center gap-2 text-xs md:text-sm font-semibold cursor-pointer ${isLabFullscreen ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'}`}
                >
                  {isLabFullscreen ? '🗗 Exit Fullscreen' : '🔲 Fullscreen'}
                </button>
                <button 
                  onClick={() => { 
                    if (document.fullscreenElement) document.exitFullscreen();
                    setActiveLab(null); 
                    setIsLabFullscreen(false); 
                  }} 
                  className="px-3 py-1.5 md:py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 transition-colors text-xs md:text-sm cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe 
                srcDoc={activeLab.content} 
                className="w-full h-full border-none absolute inset-0" 
                title={activeLab.name} 
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      {/* === NATIVE FULLSCREEN DEPARTMENT SYLLABUS MODAL === */}
      {isSyllabusOpen && (
        <div ref={syllabusViewerRef} className={`fixed inset-0 z-[70] bg-[#05080e]/95 backdrop-blur-xl flex flex-col animate-fade-in overflow-hidden ${isSyllabusFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
          <div className={`mx-auto flex flex-col h-full bg-[#0a0f18] border border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)] overflow-hidden transition-all duration-300 ${isSyllabusFullscreen ? 'w-full max-w-none rounded-none border-none' : 'w-full max-w-5xl rounded-3xl'}`}>
            <div className="p-4 md:p-6 border-b border-slate-800 bg-[#0f141d] flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
              
              <div className="flex flex-col gap-1 relative z-10">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-tight flex items-center gap-3">
                  <span>📜</span> Department Syllabus
                </h2>
                <p className="text-xs text-slate-400 font-medium ml-1">Official Curriculum & Course Guidelines</p>
              </div>

              <div className="flex items-center gap-2 md:gap-3 relative z-10">
                <button 
                  onClick={() => toggleNativeFullscreen(syllabusViewerRef, isSyllabusFullscreen, setIsSyllabusFullscreen)} 
                  className={`px-3 py-1.5 md:py-2 rounded-lg border transition-colors flex items-center gap-2 text-xs md:text-sm font-semibold cursor-pointer ${isSyllabusFullscreen ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'}`}
                >
                  {isSyllabusFullscreen ? '🗗 Exit Fullscreen' : '🔲 Fullscreen'}
                </button>
                <a href={SYLLABUS_PDF_LINK.replace('/preview', '/view')} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-bold transition-colors">
                  <span>🖨️</span> Drive
                </a>
                <button 
                  onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen();
                    setIsSyllabusOpen(false);
                    setIsSyllabusFullscreen(false);
                  }} 
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white relative w-full h-full">
              <iframe 
                src={SYLLABUS_PDF_LINK}
                className="w-full h-full border-none absolute inset-0"
                title="Department Syllabus PDF"
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        </div>
      )}
      {/* ==================================== */}

      {/* === EEE DIGITAL LIBRARY MODAL === */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[70] bg-[#05080e]/95 backdrop-blur-xl flex flex-col p-4 md:p-8 animate-fade-in overflow-hidden">
          <div className="w-full max-w-6xl mx-auto flex flex-col h-full bg-[#0a0f18] rounded-3xl border border-indigo-500/30 shadow-[0_0_80px_rgba(99,102,241,0.15)] overflow-hidden">
            
            {/* Library Header */}
            <div className="p-6 md:p-8 border-b border-slate-800 bg-[#0f141d] flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="flex flex-col gap-2 relative z-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight flex items-center gap-3">
                  <span>📚</span> EEE Digital Library
                </h2>
                <p className="text-sm text-slate-400 font-medium">আপনার ট্রিপল-ই ডিপার্টমেন্টের সকল রেফারেন্স বইয়ের সংগ্রহশালা</p>
              </div>

              <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search books, authors..." 
                    value={librarySearchQuery}
                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
                  />
                </div>
                <button onClick={() => setIsLibraryOpen(false)} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer flex-shrink-0">
                  ✕
                </button>
              </div>
            </div>

            {/* Library Categories */}
            <div className="px-6 md:px-8 py-4 bg-[#0a0f18] border-b border-slate-800/50 overflow-x-auto flex gap-3 scrollbar-none">
              {libraryCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setLibraryCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${libraryCategory === cat ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Books Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#05080e]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {EEE_BOOKS.filter(book => {
                  const matchesSearch = book.title.toLowerCase().includes(librarySearchQuery.toLowerCase()) || book.author.toLowerCase().includes(librarySearchQuery.toLowerCase());
                  const matchesCategory = libraryCategory === 'All' || book.category === libraryCategory;
                  return matchesSearch && matchesCategory;
                }).map(book => (
                  <div key={book.id} className="group relative bg-[#0f141d] border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col">
                    <div className={`h-32 w-full bg-gradient-to-br ${book.color} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20"></div>
                      <span className="text-6xl filter drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-500">{book.icon}</span>
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                        {book.category}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-slate-100 mb-1 leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-slate-500 font-medium mb-5">{book.author}</p>
                      
                      <div className="mt-auto">
                        <a href={book.link} target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <span>📖</span> Read / Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}

      {/* === ABOUT PROJECT MODAL === */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[70] bg-[#05080e]/95 backdrop-blur-xl flex flex-col p-4 md:p-8 animate-fade-in overflow-hidden items-center justify-center">
          <div className="w-full max-w-3xl flex flex-col bg-[#0a0f18] rounded-3xl border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.15)] overflow-hidden relative max-h-[90vh]">
            
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Header / Title */}
            <div className="p-6 md:p-8 text-center border-b border-slate-800/80 relative z-10 flex-shrink-0">
              <button onClick={() => setIsAboutOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer">✕</button>
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight mb-2">SAHACHAR</h2>
              <p className="text-sm md:text-base text-cyan-200/80 font-medium tracking-widest uppercase">An AI-Powered EEE Learning & Simulation Engine</p>
            </div>

            {/* Body (Now Scrollable) */}
            <div className="p-6 md:p-10 flex flex-col gap-8 relative z-10 bg-[#05080e]/50 overflow-y-auto scrollbar-thin">
              
              {/* University Info */}
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-bold text-slate-200 mb-1">Department of Electrical and Electronic Engineering (EEE)</h3>
                <h4 className="text-base md:text-lg font-semibold text-slate-400">Begum Rokeya University, Rangpur</h4>
              </div>

              {/* Submitted To */}
              <div className="bg-[#0f141d] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-inner text-center hover:border-cyan-500/30 transition-colors">
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">Course Instructor / Submitted To</p>
                <h3 className="text-xl font-bold text-slate-100 mb-1">A. K. M. Mahmudul Haque</h3>
                <p className="text-sm text-slate-500">Assistant Professor</p>
              </div>

              {/* Submitted By */}
              <div className="flex flex-col text-center">
                <p className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-4">Project Team / Submitted By</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Member 1 */}
                  <div className="bg-[#0f141d] border border-slate-800 rounded-2xl p-5 shadow-inner hover:border-blue-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mx-auto mb-3 border border-blue-500/30">👨‍💻</div>
                    <h3 className="text-lg font-bold text-slate-100 mb-1">Gopal Chandro Roy</h3>
                    <p className="text-sm text-slate-400 font-mono">ID: 12216058</p>
                  </div>
                  {/* Member 2 */}
                  <div className="bg-[#0f141d] border border-slate-800 rounded-2xl p-5 shadow-inner hover:border-blue-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl mx-auto mb-3 border border-cyan-500/30">👨‍💻</div>
                    <h3 className="text-lg font-bold text-slate-100 mb-1">Pingky Roy Sarker</h3>
                    <p className="text-sm text-slate-400 font-mono">ID: 12216048</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* ======================================= */}

      {/* হেডার */}
      <header className={`p-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-[#131314]/80 border-slate-800/50' : 'bg-[#f0f4f9]/80 border-slate-300/50'}`}>
        <div className="flex items-center gap-2">
          {/* SIDEBAR TOGGLE BUTTON */}
          <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 md:p-2 mr-1 rounded-lg border border-slate-700 bg-slate-800/80 text-cyan-400 hover:bg-slate-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
          </button>
          
          <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight hidden sm:block">
            SAHACHAR
          </h2>
          <span className="text-[10px] md:text-xs px-2 py-0.5 rounded bg-blue-500/20 text-cyan-400 font-semibold border border-blue-500/30">সহচর</span>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* AI মডেল সিলেক্টর ড্রপডাউন */}
          <div className="relative inline-block">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className={`text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-all ${
                selectedProvider === 'groq'
                  ? 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
              }`}
            >
              <option value="groq" className="bg-slate-900 text-slate-100">⚡ Groq (GPT-OSS 120B)</option>
              <option value="gemini" className="bg-slate-900 text-slate-100">✨ Gemini (3.6 Flash)</option>
            </select>
          </div>

          {/* কী ম্যানেজার বাটন */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className={`text-[10px] md:text-xs font-mono px-2 md:px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              isDarkMode ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20' : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span>🔑 <span className="hidden sm:inline">Key Manager</span></span>
          </button>

          {/* ফ্রেশ সেশন বাটন */}
          <button
            onClick={handleResetSession}
            title="Start New Session"
            className={`text-[10px] md:text-xs px-2 md:px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer font-medium ${
              isDarkMode ? 'border-slate-700 bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🔄</span>
            <span className="hidden md:inline">New Session</span>
          </button>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 md:p-2 rounded-full border transition-all cursor-pointer ${isDarkMode ? 'border-slate-700 bg-slate-800 text-yellow-400' : 'border-slate-300 bg-white text-slate-700'}`}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* 🔑 API Key Manager Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f141d] border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                <span>🔑</span>
                <span>API Key Configuration</span>
              </div>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-slate-400 hover:text-white text-xl cursor-pointer">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-mono text-orange-400 mb-1.5 font-bold">
                ⚡ Groq API Key (gsk_...)
              </label>
              <input
                type="text"
                value={groqKeyInput}
                onChange={(e) => setGroqKeyInput(e.target.value)}
                placeholder="gsk_YourGroqApiKey..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-orange-400"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-mono text-cyan-400 mb-1.5 font-bold">
                ✨ Gemini API Key (AIzaSy...)
              </label>
              <input
                type="text"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSyYourGeminiApiKey..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setIsKeyModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveKeys} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg cursor-pointer">
                Save All Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {/* চ্যাট এরিয়া */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
          {messages.map((msg) => {
            const { thought, content } = msg.sender === 'ai' ? parseThoughtAndContent(msg.text) : { thought: null, content: msg.text };

            return (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-5 md:p-7 rounded-3xl max-w-[98%] md:max-w-[95%] transition-all ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                      : isDarkMode ? 'bg-transparent text-[#e3e3e3]' : 'bg-transparent text-[#1f1f1f]'
                  }`}>
                  
                  {msg.greeting && (
                    <span className="font-semibold text-blue-400 block mb-4 text-lg">{msg.greeting}</span>
                  )}

                  {msg.image && (
                    <img src={msg.image} alt="Uploaded Circuit" className="max-w-sm w-full h-auto rounded-2xl mb-5 shadow-sm border border-blue-400/20" />
                  )}
                  
                  {thought && (
                    <ThinkingAccordion thought={thought} isDarkMode={isDarkMode} />
                  )}

                  <div className={`prose max-w-none break-words text-[15.5px] md:text-[16px] leading-relaxed md:leading-8 tracking-wide
                    ${isDarkMode ? 'prose-invert prose-headings:text-slate-100 prose-strong:text-slate-200 prose-a:text-blue-400' : 'prose-headings:text-slate-900 prose-strong:text-slate-800 prose-a:text-blue-600'} 
                    prose-p:mb-5 
                    prose-li:my-2 prose-li:leading-relaxed 
                    prose-ul:my-5 prose-ol:my-5`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath, remarkGfm]} 
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        table({node, ...props}) {
                          return (
                            <div className="w-full my-6 overflow-x-auto rounded-xl border border-slate-700/80 shadow-xl">
                              <table className={`w-full text-left border-collapse text-sm font-sans ${isDarkMode ? 'bg-[#0f141d]' : 'bg-white'}`} {...props} />
                            </div>
                          );
                        },
                        thead({node, ...props}) {
                          return (
                            <thead className={`border-b border-slate-700 ${isDarkMode ? 'bg-slate-800/90 text-cyan-300' : 'bg-slate-200 text-slate-800'} font-semibold`} {...props} />
                          );
                        },
                        th({node, ...props}) {
                          return (
                            <th className="px-4 py-3 text-center border-r border-slate-700/50 last:border-r-0 font-bold" {...props} />
                          );
                        },
                        td({node, ...props}) {
                          return (
                            <td className="px-4 py-2.5 text-center border-b border-r border-slate-800/50 last:border-r-0 font-mono text-[13.5px]" {...props} />
                          );
                        },
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');

                          if (!inline && match && (match[1] === 'logic' || match[1] === 'digital')) {
                            return <LogicGateSimulator rawConfig={codeString} isDarkMode={isDarkMode} />;
                          }

                          if (!inline && match && (match[1] === 'circuit' || match[1] === 'svg')) {
                            return (
                              <div className={`w-full my-6 rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#0f141d] border-slate-700' : 'bg-white border-slate-300'}`}>
                                <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-semibold ${isDarkMode ? 'bg-[#18202f] border-slate-700 text-cyan-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                                  <div className="flex items-center gap-2"><span className="text-base">⚡</span><span>ইলেকট্রিক্যাল সার্কিট স্কিম্যাটিক</span></div>
                                </div>
                                <div className={`w-full p-8 flex justify-center items-center overflow-x-auto relative ${isDarkMode ? 'circuit-grid-dark' : 'circuit-grid-light'}`}>
                                  <div className="circuit-svg-wrapper w-full max-w-4xl flex justify-center" dangerouslySetInnerHTML={{ __html: codeString }} />
                                </div>
                              </div>
                            );
                          }
                          
                          if (!inline && match && match[1] === 'ic_pinout') {
                            return <ICPinoutViewer rawConfig={codeString} isDarkMode={isDarkMode} />;
                          }

                          if (!inline && match && match[1] === 'simulator') {
                            return <InteractiveOhmSimulator rawConfig={codeString} isDarkMode={isDarkMode} />;
                          }
                          
                          if (!inline && match && match[1] === 'mermaid') {
                            return <MermaidDiagram chart={codeString} isDarkMode={isDarkMode} />;
                          }

                          return <code className={`${className} ${isDarkMode ? 'bg-[#2a2a2c] text-blue-300' : 'bg-slate-200 text-blue-700'} px-2 py-1 rounded-md text-[14px]`} {...props}>{children}</code>;
                        }
                      }}
                    >
                      {preprocessLaTeX(content)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}

          {rateLimitTimer !== null && (
            <div className="w-full flex justify-center">
              <div className="p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-[#181308]/90 max-w-xl w-full shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400/50 bg-amber-500/20 flex items-center justify-center text-2xl mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  ⏳
                </div>
                <h3 className="text-lg font-bold text-amber-300 mb-1">
                  সবগুলো API Key কুলডাউন মোডে আছে
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mb-4">
                  আপনার পুলের সকল API Key-এর রিকোয়েস্ট কোটা সাময়িকভাবে পূর্ণ হয়েছে। সিস্টেম স্বয়ংক্রিয়ভাবে রিস্টোর হচ্ছে।
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-400 bg-amber-400/10 font-mono text-sm text-amber-300 font-bold mb-3 shadow-inner">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span>পুনরায় চালু হতে বাকি: {rateLimitTimer}s</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                    style={{ width: `${Math.max(0, 100 - (rateLimitTimer / 60) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className={`px-5 py-4 rounded-3xl rounded-tl-sm flex items-center gap-2 ${isDarkMode ? 'bg-transparent text-slate-300' : 'bg-transparent text-slate-700'}`}>
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* সাজেশন বাটন */}
      <div className={`px-4 py-3 transition-colors duration-300 ${isDarkMode ? 'bg-[#131314]' : 'bg-[#f0f4f9]'}`}>
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className={`text-xs font-semibold whitespace-nowrap ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Suggested:</span>
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              disabled={rateLimitTimer !== null}
              onClick={() => handleSendMessage(question)}
              className={`text-sm border px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-medium cursor-pointer ${
                rateLimitTimer !== null 
                  ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600' 
                  : isDarkMode 
                    ? 'bg-[#1e1e20] hover:bg-[#2a2a2c] text-[#e3e3e3] border-slate-700/50' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* ইনপুট এরিয়া */}
      <div className={`p-4 pb-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#131314]' : 'bg-[#f0f4f9]'}`}>
        {imagePreview && (
          <div className="max-w-4xl mx-auto mb-3 relative inline-block">
            <div className="relative group">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-2xl border-2 border-blue-500 shadow-lg" />
              <button onClick={removeSelectedImage} className="absolute -top-2 -right-2 bg-slate-800 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-xl hover:bg-red-500 cursor-pointer border-2 border-[#131314] transition-colors">
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex gap-3 items-end bg-transparent">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          
          <button 
            disabled={rateLimitTimer !== null}
            onClick={() => fileInputRef.current.click()} 
            className={`p-4 rounded-full flex items-center justify-center transition-all border cursor-pointer ${
              rateLimitTimer !== null
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : isDarkMode 
                  ? 'bg-[#1e1e20] border-slate-700/50 text-slate-300 hover:bg-[#2a2a2c]' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
            }`} 
            title="Upload Circuit Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>

          <textarea 
            value={inputText}
            disabled={rateLimitTimer !== null}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              rateLimitTimer !== null
                ? `সিস্টেম কুলডাউনে আছে... ${rateLimitTimer}s পর পুনরায় লিখতে পারবেন`
                : `আপনার ইঞ্জিনিয়ারিং প্রশ্ন লিখুন (${selectedProvider === 'groq' ? '⚡ Groq GPT-OSS 120B' : '✨ Gemini 3.6'})...`
            }
            rows="1"
            className={`flex-1 px-6 py-4 rounded-3xl focus:outline-none border transition-all text-[16px] font-normal resize-none overflow-hidden min-h-[56px] ${
              rateLimitTimer !== null
                ? 'bg-[#181308]/60 border-amber-500/30 text-amber-300/80 cursor-not-allowed placeholder-amber-400/60'
                : isDarkMode 
                  ? 'bg-[#1e1e20] text-slate-100 placeholder-slate-500 border-slate-700/50 focus:border-slate-500' 
                  : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300 focus:border-slate-400'
            }`}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={(!inputText.trim() && !selectedFile) || rateLimitTimer !== null}
            className={`p-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center ${
              rateLimitTimer !== null
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-not-allowed'
                : (inputText.trim() || selectedFile) 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer' 
                  : isDarkMode ? 'bg-[#1e1e20] text-slate-600 cursor-not-allowed border border-slate-700/50' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}>
            {rateLimitTimer !== null ? (
              <span className="font-mono text-xs font-bold">{rateLimitTimer}s</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;