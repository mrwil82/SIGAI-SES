import { useState } from "react";

/* ─────────────────────────────────────────────
   FUSION SYSTEM: Emerald Core × Neomorphic Hub
   ───────────────────────────────────────────── */

const C = {
  // Base (Neomorphic Blues → shifted to Emerald)
  bg0:  "#0A0F0D",   // body
  bg1:  "#101820",   // neomorphic base (azul-oscuro del hub)
  bg2:  "#141F1A",   // cards surface
  bg3:  "#1A2830",   // cards elevadas / sidebar activo
  bg4:  "#1E3038",   // hover overlay
  bgIn: "#0C1614",   // inputs

  // Borders neomórficos
  bLight: "rgba(255,255,255,0.06)",
  bDark:  "rgba(0,0,0,0.4)",
  bFocus: "#00C26A",

  // Brand Emerald (del primer sistema)
  eP:  "#00C26A",
  eB:  "#00E87A",
  eG:  "#00FF88",
  eM:  "#0D3D26",
  eD:  "#071F14",

  // Data-viz (del hub neomórfico)
  chartGreen:  "#00C26A",
  chartBlue:   "#4A9EFF",
  chartOrange: "#FF8C42",
  chartPurple: "#9B6DFF",
  chartTeal:   "#00D4CC",

  // Accents
  gold:   "#F5A623",
  danger: "#FF4D4D",
  cyan:   "#00D4CC",

  // Text
  t1: "#E8F5EC",
  t2: "#9AB8A4",
  t3: "#5A7A65",
  tA: "#00C26A",
  tW: "#F5A623",
};

// Neomorphic shadow helper
const neoShadow = (intensity = 1) => ({
  boxShadow: `
    ${4 * intensity}px ${4 * intensity}px ${12 * intensity}px rgba(0,0,0,${0.5 * intensity}),
    -${2 * intensity}px -${2 * intensity}px ${8 * intensity}px rgba(255,255,255,${0.03 * intensity}),
    inset 0 1px 0 rgba(255,255,255,0.05)
  `,
});

const neoInset = {
  boxShadow: `
    inset 3px 3px 8px rgba(0,0,0,0.5),
    inset -1px -1px 4px rgba(255,255,255,0.03)
  `,
};

const glassMorphism = {
  backdropFilter: "blur(12px)",
  backgroundColor: "rgba(20, 31, 26, 0.7)",
  border: "1px solid rgba(255,255,255,0.06)",
};

// ─── Components ────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.25em",
        textTransform: "uppercase", color: C.t3,
      }}>{children}</span>
    </div>
  );
}

function Card({ children, style = {}, glow = false }) {
  return (
    <div style={{
      backgroundColor: C.bg2,
      borderRadius: 14,
      border: `1px solid ${C.bLight}`,
      padding: 16,
      ...neoShadow(1),
      ...(glow ? { boxShadow: `0 0 30px rgba(0,194,106,0.1), 4px 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)` } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Donut Chart SVG ────────────────────────────────────
function DonutChart({ percent = 78, color = C.eP, size = 80, label }) {
  const r = 28, cx = 40, cy = 40;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.eM} strokeWidth="6" />
        {/* Progress */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          filter="url(#glow)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        {/* Inner glow ring */}
        <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={C.eM} strokeWidth="1" opacity="0.4" />
        {/* Text */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fill={C.t1} fontSize="14" fontWeight="700" fontFamily="monospace">
          {percent}%
        </text>
      </svg>
      {label && <span style={{ fontSize: 10, color: C.t3 }}>{label}</span>}
    </div>
  );
}

// ─── Mini Bar Chart ──────────────────────────────────────
function MiniBar({ data, colors, height = 60 }) {
  const max = Math.max(...data.flat());
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 12} ${height}`} preserveAspectRatio="none">
      {data.map((group, gi) =>
        group.map((val, ci) => {
          const bh = (val / max) * (height - 4);
          const w = 4, gap = 1;
          const x = gi * 12 + ci * (w + gap);
          return (
            <rect key={`${gi}-${ci}`}
              x={x} y={height - bh} width={w} height={bh}
              fill={colors[ci]} rx={1.5} opacity={0.9}
            />
          );
        })
      )}
    </svg>
  );
}

// ─── Mini Line Chart ─────────────────────────────────────
function MiniLine({ datasets, width = 200, height = 60 }) {
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        {datasets.map((d, i) => (
          <linearGradient key={i} id={`lg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={d.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={d.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {datasets.map((d, di) => {
        const pts = d.values;
        const max = Math.max(...datasets.flatMap(x => x.values));
        const min = Math.min(...datasets.flatMap(x => x.values));
        const xs = pts.map((_, i) => (i / (pts.length - 1)) * width);
        const ys = pts.map(v => height - 4 - ((v - min) / (max - min + 1)) * (height - 8));
        const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
        const area = path + ` L${width},${height} L0,${height} Z`;
        return (
          <g key={di}>
            <path d={area} fill={`url(#lg${di})`} />
            <path d={path} fill="none" stroke={d.color} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Progress Bar ────────────────────────────────────────
function ProgressBar({ value, color, label, sublabel }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.t2 }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{sublabel}</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, backgroundColor: C.eM, ...neoInset }}>
        <div style={{
          width: `${value}%`, height: "100%", borderRadius: 4,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 8px ${color}66`,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Toggle ─────────────────────────────────────────────
function Toggle({ on, color = C.eP }) {
  return (
    <div style={{
      width: 36, height: 20, borderRadius: 10,
      backgroundColor: on ? color : C.bg3,
      ...neoShadow(0.7),
      position: "relative", display: "flex", alignItems: "center",
      padding: "0 2px", transition: "background 0.2s",
      boxShadow: on
        ? `0 0 12px ${color}66, inset 0 1px 3px rgba(0,0,0,0.3)`
        : `inset 2px 2px 6px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(255,255,255,0.03)`,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%",
        backgroundColor: on ? "#fff" : C.t3,
        transform: on ? "translateX(16px)" : "translateX(0)",
        transition: "all 0.2s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
      }} />
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{
      backgroundColor: bg, color,
      fontSize: 10, fontWeight: 700,
      padding: "3px 8px", borderRadius: 20,
      border: `1px solid ${color}33`,
    }}>{label}</span>
  );
}

// ─── Input ───────────────────────────────────────────────
function NeoInput({ placeholder, type = "text" }) {
  return (
    <input type={type} placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        backgroundColor: C.bgIn,
        border: `1px solid ${C.bLight}`,
        borderRadius: 8, padding: "8px 12px",
        fontSize: 11, color: C.t2, outline: "none",
        fontFamily: "inherit",
        ...neoInset,
      }}
    />
  );
}

// ─── Tabs ────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Visión general" },
  { id: "components", label: "Componentes" },
  { id: "tokens", label: "Tokens CSS" },
  { id: "advice", label: "Mi consejo" },
];

// ─── APP ─────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("overview");
  const [toggles, setToggles] = useState({ a: true, b: false, c: true });

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.bg0, color: C.t1,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: "20px 16px",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, backgroundColor: C.bg3,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, ...neoShadow(1.2),
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.t1, lineHeight: 1 }}>
              Fusion System
            </div>
            <div style={{ fontSize: 9, color: C.t3, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
              Emerald Core × Neomorphic Hub
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.eP, boxShadow: `0 0 8px ${C.eP}` }} />
            <span style={{ fontSize: 9, color: C.t3 }}>v1.0</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: C.t3, margin: 0, lineHeight: 1.5 }}>
          Guía de fusión de estilos · Lista para implementar en Tailwind CSS
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: "flex", gap: 3, marginBottom: 20, overflowX: "auto",
        backgroundColor: C.bg2, padding: 4, borderRadius: 12,
        border: `1px solid ${C.bLight}`, ...neoInset,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 10,
              fontWeight: 700, border: "none", cursor: "pointer",
              fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s",
              backgroundColor: tab === t.id ? C.eP : "transparent",
              color: tab === t.id ? C.bg0 : C.t3,
              ...(tab === t.id ? { boxShadow: `0 0 16px ${C.eP}55` } : {}),
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Comparativa visual */}
          <SectionTitle>Los dos sistemas que fusionamos</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

            <Card glow style={{ borderColor: `${C.eP}33` }}>
              <div style={{ fontSize: 9, color: C.eP, letterSpacing: "0.2em", marginBottom: 6 }}>SISTEMA A</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Emerald Core</div>
              <div style={{ fontSize: 10, color: C.t3, lineHeight: 1.6 }}>
                · Verde dominante<br />
                · Alto contraste<br />
                · Cards planas<br />
                · Glow effects<br />
                · Fondo neutro
              </div>
            </Card>

            <Card style={{ borderColor: `${C.chartBlue}33` }}>
              <div style={{ fontSize: 9, color: C.chartBlue, letterSpacing: "0.2em", marginBottom: 6 }}>SISTEMA B</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Neo Data Hub</div>
              <div style={{ fontSize: 10, color: C.t3, lineHeight: 1.6 }}>
                · Azul-índigo base<br />
                · Neomorphism<br />
                · Profundidad 3D<br />
                · Glassmorphism<br />
                · Multi-color data
              </div>
            </Card>
          </div>

          {/* Color overlay visual */}
          <SectionTitle>Paleta fusionada — 6 grupos</SectionTitle>
          {[
            {
              label: "Fondos", items: [
                { n: "bg-0", c: C.bg0 }, { n: "bg-1", c: C.bg1 },
                { n: "bg-2", c: C.bg2 }, { n: "bg-3", c: C.bg3 },
                { n: "bg-4", c: C.bg4 },
              ]
            },
            {
              label: "Brand Emerald", items: [
                { n: "e-primary", c: C.eP }, { n: "e-bright", c: C.eB },
                { n: "e-glow", c: C.eG }, { n: "e-muted", c: C.eM },
                { n: "e-deep", c: C.eD },
              ]
            },
            {
              label: "Data Viz", items: [
                { n: "chart-green", c: C.chartGreen }, { n: "chart-blue", c: C.chartBlue },
                { n: "chart-orange", c: C.chartOrange }, { n: "chart-purple", c: C.chartPurple },
                { n: "chart-teal", c: C.chartTeal },
              ]
            },
            {
              label: "Semánticos", items: [
                { n: "gold / warn", c: C.gold }, { n: "danger", c: C.danger },
                { n: "cyan / info", c: C.cyan },
              ]
            },
          ].map(group => (
            <div key={group.label}>
              <div style={{ fontSize: 9, color: C.t3, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
                {group.label}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {group.items.map(item => (
                  <div key={item.n} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      backgroundColor: item.c,
                      border: `1px solid rgba(255,255,255,0.08)`,
                      marginBottom: 4,
                      ...neoShadow(0.8),
                    }} />
                    <div style={{ fontSize: 8, color: C.t3, maxWidth: 48, wordBreak: "break-word" }}>{item.n}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Effects strip */}
          <SectionTitle>Efectos de profundidad</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Neomorphic raised", s: neoShadow(1.5) },
              { label: "Neomorphic inset", s: neoInset },
              { label: "Glassmorphism", s: glassMorphism },
              { label: "Glow — Emerald", s: { backgroundColor: C.bg2, boxShadow: `0 0 24px ${C.eP}33, 4px 4px 12px rgba(0,0,0,0.5)`, border: `1px solid ${C.eP}22` } },
              { label: "Glow — Blue", s: { backgroundColor: C.bg2, boxShadow: `0 0 24px ${C.chartBlue}33, 4px 4px 12px rgba(0,0,0,0.5)`, border: `1px solid ${C.chartBlue}22` } },
            ].map(fx => (
              <div key={fx.label} style={{
                backgroundColor: C.bg2, borderRadius: 10, padding: "12px 14px",
                border: `1px solid ${C.bLight}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                ...fx.s,
              }}>
                <span style={{ fontSize: 11, color: C.t2 }}>{fx.label}</span>
                <span style={{ fontSize: 9, color: C.t3, fontFamily: "monospace" }}>preview ↑</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: COMPONENTS ── */}
      {tab === "components" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Stat Cards */}
          <SectionTitle>Stat Cards — Neomorphic + Glow</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Proyectos", val: "24", sub: "+3 este mes", color: C.eP },
              { label: "Usuarios", val: "1.2K", sub: "↑ 8%", color: C.chartBlue },
              { label: "Pendientes", val: "7", sub: "⚠ vence pronto", color: C.gold },
              { label: "Errores", val: "2", sub: "↓ -1 hoy", color: C.danger },
            ].map(s => (
              <div key={s.label} style={{
                backgroundColor: C.bg2, borderRadius: 12, padding: 14,
                border: `1px solid rgba(255,255,255,0.04)`,
                boxShadow: `4px 4px 12px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.02), 0 0 20px ${s.color}15`,
              }}>
                <div style={{ fontSize: 9, color: C.t3, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.t1, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: s.color, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <SectionTitle>Gráficas — Data Viz</SectionTitle>
          <Card>
            <div style={{ fontSize: 10, color: C.t3, marginBottom: 10 }}>Rendimiento mensual</div>
            <MiniLine height={70} width={240} datasets={[
              { values: [30, 45, 40, 60, 55, 75, 80, 90, 85, 95], color: C.eP },
              { values: [20, 30, 50, 35, 65, 50, 70, 60, 75, 80], color: C.chartBlue },
              { values: [10, 20, 25, 30, 20, 40, 35, 50, 45, 60], color: C.chartOrange },
            ]} />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {[
                { label: "Rendimiento", c: C.eP },
                { label: "Usuarios", c: C.chartBlue },
                { label: "Recursos", c: C.chartOrange },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: l.c }} />
                  <span style={{ fontSize: 9, color: C.t3 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 10, color: C.t3, marginBottom: 10 }}>Asignación de recursos</div>
            <MiniBar height={65}
              data={Array.from({ length: 8 }, () => [
                Math.random() * 80 + 20,
                Math.random() * 60 + 10,
                Math.random() * 40 + 10,
              ])}
              colors={[C.eP, C.chartBlue, C.chartOrange]}
            />
          </Card>

          {/* Donut row */}
          <SectionTitle>Progress Rings</SectionTitle>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <DonutChart percent={78} color={C.eP} label="Progreso" />
              <DonutChart percent={65} color={C.chartBlue} label="Conversión" />
              <DonutChart percent={42} color={C.chartOrange} label="Carga" />
            </div>
          </Card>

          {/* Progress bars */}
          <SectionTitle>Barras de progreso</SectionTitle>
          <Card>
            <ProgressBar value={84} color={C.eP} label="Website Redesign" sublabel="Activo" />
            <ProgressBar value={100} color={C.chartBlue} label="Mobile App V2" sublabel="Completado" />
            <ProgressBar value={55} color={C.gold} label="Data Migration" sublabel="En espera" />
            <ProgressBar value={30} color={C.chartPurple} label="Internal Tool" sublabel="En espera" />
          </Card>

          {/* Toggles & Badges */}
          <SectionTitle>Toggles · Badges · Chips</SectionTitle>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Neural Rendering", key: "a", color: C.eP },
                { label: "Quantum Sync", key: "b", color: C.chartBlue },
                { label: "Deep Encryption", key: "c", color: C.eP },
              ].map(item => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.t2 }}>{item.label}</span>
                  <div onClick={() => setToggles(p => ({ ...p, [item.key]: !p[item.key] }))} style={{ cursor: "pointer" }}>
                    <Toggle on={toggles[item.key]} color={item.color} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${C.bLight}`, marginTop: 12, paddingTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Badge label="● ACTIVO" color={C.eP} bg={C.eM} />
              <Badge label="COMPLETADO" color={C.chartBlue} bg="#0D1F3D" />
              <Badge label="⚠ EN ESPERA" color={C.gold} bg="#3D2800" />
              <Badge label="✕ ERROR" color={C.danger} bg="#3D0000" />
              <Badge label="○ IDLE" color={C.t3} bg={C.bg3} />
            </div>
          </Card>

          {/* Form / Login */}
          <SectionTitle>Formulario Login — Neomorphic</SectionTitle>
          <Card glow>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Bienvenido</div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>Ingresa a tu cuenta</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <label style={{ fontSize: 9, color: C.t3, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>
                  Usuario
                </label>
                <NeoInput placeholder="email@empresa.com" />
              </div>
              <div>
                <label style={{ fontSize: 9, color: C.t3, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>
                  Contraseña
                </label>
                <NeoInput placeholder="••••••••" type="password" />
              </div>
              <button style={{
                width: "100%", padding: "10px",
                backgroundColor: C.eP, color: C.bg0,
                fontWeight: 700, fontSize: 11, borderRadius: 8,
                border: "none", cursor: "pointer", fontFamily: "inherit",
                letterSpacing: "0.1em", marginTop: 4,
                boxShadow: `0 0 20px ${C.eP}55, 0 4px 12px rgba(0,0,0,0.4)`,
                transition: "all 0.2s",
              }}>
                INGRESAR →
              </button>
            </div>
          </Card>

          {/* Table */}
          <SectionTitle>Tabla — Reports style</SectionTitle>
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.bLight}` }}>
                    {["Reporte", "Tipo", "Fecha", "Estado", "Acción"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", color: C.t3, paddingBottom: 8, paddingRight: 12,
                        fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Insp. Ronderos", "PDF", "23/02/2025", "complete"],
                    ["Insp. Caqueza", "DOCX", "15/03/2025", "complete"],
                    ["Rutas Rurales", "XLSX", "10/04/2025", "pending"],
                    ["Análisis Q2", "PDF", "01/05/2025", "review"],
                  ].map(([name, type, date, status]) => (
                    <tr key={name} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg3}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td style={{ padding: "8px 12px 8px 0", color: C.t1 }}>{name}</td>
                      <td style={{ padding: "8px 12px 8px 0", color: C.t3 }}>{type}</td>
                      <td style={{ padding: "8px 12px 8px 0", color: C.t3 }}>{date}</td>
                      <td style={{ padding: "8px 12px 8px 0" }}>
                        <Badge
                          label={status === "complete" ? "● Completo" : status === "pending" ? "⏳ Pendiente" : "◎ Revisión"}
                          color={status === "complete" ? C.eP : status === "pending" ? C.gold : C.chartBlue}
                          bg={status === "complete" ? C.eM : status === "pending" ? "#3D2800" : "#0D1F3D"}
                        />
                      </td>
                      <td style={{ padding: "8px 0" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {["👁", "⬇", "✕"].map((icon, i) => (
                            <button key={i} style={{
                              width: 22, height: 22, borderRadius: 6,
                              backgroundColor: C.bg3, border: `1px solid ${C.bLight}`,
                              color: C.t3, fontSize: 10, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              ...neoShadow(0.6),
                            }}>{icon}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}

      {/* ── TAB: TOKENS ── */}
      {tab === "tokens" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SectionTitle>tailwind.config.js — Sistema Fusionado</SectionTitle>
          <div style={{ position: "relative" }}>
            <pre style={{
              backgroundColor: C.bgIn, border: `1px solid ${C.bLight}`,
              borderRadius: 12, padding: 16, fontSize: 10, color: C.t2,
              overflow: "auto", lineHeight: 1.7, margin: 0,
              ...neoInset,
            }}>{`// tailwind.config.js — Fusion System
module.exports = {
  theme: {
    extend: {
      colors: {
        // ── Backgrounds (neomórficos) ──
        'bg-0': '#0A0F0D',
        'bg-1': '#101820',
        'bg-2': '#141F1A',
        'bg-3': '#1A2830',
        'bg-4': '#1E3038',
        'bg-input': '#0C1614',

        // ── Brand Emerald ──
        'emerald': {
          primary: '#00C26A',
          bright:  '#00E87A',
          glow:    '#00FF88',
          muted:   '#0D3D26',
          deep:    '#071F14',
        },

        // ── Data Visualization ──
        'chart': {
          green:  '#00C26A',
          blue:   '#4A9EFF',
          orange: '#FF8C42',
          purple: '#9B6DFF',
          teal:   '#00D4CC',
        },

        // ── Semánticos ──
        'gold':   '#F5A623',
        'danger': '#FF4D4D',
        'cyan':   '#00D4CC',

        // ── Texto ──
        'content': {
          primary:   '#E8F5EC',
          secondary: '#9AB8A4',
          muted:     '#5A7A65',
        },
      },
      boxShadow: {
        // Neomorphic
        'neo':       '4px 4px 12px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.03)',
        'neo-inset': 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -1px -1px 4px rgba(255,255,255,0.03)',
        'neo-lg':    '8px 8px 20px rgba(0,0,0,0.6), -3px -3px 10px rgba(255,255,255,0.04)',
        // Emerald glow
        'glow-sm':   '0 0 12px rgba(0,194,106,0.3)',
        'glow-md':   '0 0 24px rgba(0,194,106,0.35)',
        'glow-lg':   '0 0 40px rgba(0,194,106,0.2)',
        // Blue glow (data hub)
        'glow-blue': '0 0 20px rgba(74,158,255,0.3)',
        // Card
        'card':      '0 4px 24px rgba(0,0,0,0.5)',
      },
      borderColor: {
        'glass':    'rgba(255,255,255,0.06)',
        'glass-md': 'rgba(255,255,255,0.10)',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
};`}</pre>
          </div>

          <SectionTitle>CSS Custom Properties</SectionTitle>
          <pre style={{
            backgroundColor: C.bgIn, border: `1px solid ${C.bLight}`,
            borderRadius: 12, padding: 16, fontSize: 10, color: C.t2,
            overflow: "auto", lineHeight: 1.7, margin: 0, ...neoInset,
          }}>{`/* Fusion System — CSS Variables */
:root {
  /* Backgrounds */
  --bg-0:     #0A0F0D;
  --bg-1:     #101820;
  --bg-2:     #141F1A;
  --bg-3:     #1A2830;
  --bg-input: #0C1614;

  /* Brand */
  --emerald:       #00C26A;
  --emerald-bright:#00E87A;
  --emerald-muted: #0D3D26;

  /* Charts */
  --chart-green:  #00C26A;
  --chart-blue:   #4A9EFF;
  --chart-orange: #FF8C42;
  --chart-purple: #9B6DFF;
  --chart-teal:   #00D4CC;

  /* Semánticos */
  --gold:   #F5A623;
  --danger: #FF4D4D;

  /* Neomorphic shadows */
  --shadow-neo: 4px 4px 12px rgba(0,0,0,.5),
    -2px -2px 8px rgba(255,255,255,.03);
  --shadow-inset: inset 3px 3px 8px rgba(0,0,0,.5),
    inset -1px -1px 4px rgba(255,255,255,.03);

  /* Glow */
  --glow-emerald: 0 0 24px rgba(0,194,106,.3);
  --glow-blue:    0 0 20px rgba(74,158,255,.3);
}`}</pre>
        </div>
      )}

      {/* ── TAB: ADVICE ── */}
      {tab === "advice" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <Card glow style={{ borderColor: `${C.eP}22` }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: C.eP }}>
              ✓ Mi recomendación: Fusionar los dos
            </div>
            <p style={{ fontSize: 11, color: C.t2, lineHeight: 1.7, margin: 0 }}>
              Los dos sistemas se complementan perfectamente. El Emerald Core te da
              identidad visual fuerte y legibilidad. El Neo Data Hub te da profundidad,
              glassmorphism y un sistema de datos completo.
            </p>
          </Card>

          {[
            {
              icon: "🎨", title: "Fondos: mezcla los dos azules",
              color: C.chartBlue,
              body: "Usa bg-1 (#101820) del Hub para áreas densas de datos — tiene ese tono azul-pizarra que hace que los gráficos respiren. Reserva bg-2 (#141F1A) verde-oscuro del Emerald para cards de estado y alertas. El contraste entre los dos tonos crea jerarquía visual sin esfuerzo."
            },
            {
              icon: "💡", title: "Emerald como color de acción",
              color: C.eP,
              body: "El verde #00C26A debe ser el único color de acción primaria: botones, CTAs, links, estados activos, toggles ON, barras de progreso de éxito. El azul #4A9EFF y el naranja #FF8C42 son exclusivamente para gráficas y datos. Nunca los uses en botones — eso confunde la jerarquía."
            },
            {
              icon: "🔮", title: "Neomorphism: úsalo con criterio",
              color: C.chartPurple,
              body: "Las sombras neomórficas funcionan en cards grandes y en inputs. En elementos pequeños como badges o chips se pierde el efecto y puede verse sucio. Regla: sombra elevada en contenedores, sombra inset en inputs y áreas de texto, glow solo en el elemento más importante de cada pantalla."
            },
            {
              icon: "📊", title: "Data viz: los 5 colores del Hub",
              color: C.chartOrange,
              body: "Los 5 colores de gráfica del Hub (verde, azul, naranja, purple, teal) son tu set de visualización. Siempre asigna el verde (#00C26A) al dato más importante o positivo — mantiene coherencia con el brand. El naranja va a advertencia, el rojo a error. Nunca uses más de 4 colores en una sola gráfica."
            },
            {
              icon: "🪟", title: "Glassmorphism: solo en modales y overlays",
              color: C.cyan,
              body: "El glassmorphism (backdrop-blur + transparencia) úsalo exclusivamente en modales, dropdowns y tooltips que flotan sobre contenido. En cards estáticas se ve pesado y reduce rendimiento. El efecto tiene más impacto cuando es escaso."
            },
            {
              icon: "⚡", title: "Para tu proyecto Inventario_SE",
              color: C.eP,
              body: "Con FastAPI + Flet el enfoque óptimo es: aplica el sistema de colores como CSS Variables en el theme de Flet, usa neomorphism solo en las cards principales del dashboard, y reserva el glow verde para notificaciones y confirmaciones de acción. Los fondos azul-pizarra del Hub ayudan a que las tablas de inventario sean más legibles."
            },
          ].map(item => (
            <Card key={item.title} style={{ borderLeft: `3px solid ${item.color}` }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 5 }}>
                    {item.title}
                  </div>
                  <p style={{ fontSize: 10, color: C.t2, lineHeight: 1.7, margin: 0 }}>
                    {item.body}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          <Card style={{ backgroundColor: C.bg3 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.t1, marginBottom: 8 }}>
              Orden de implementación sugerido
            </div>
            {[
              ["1", "Define CSS variables en globals.css", C.eP],
              ["2", "Configura tailwind.config con los tokens fusionados", C.chartBlue],
              ["3", "Crea los componentes base: Card, Button, Input, Badge", C.chartTeal],
              ["4", "Implementa el sidebar con los estilos neomórficos del Hub", C.chartOrange],
              ["5", "Usa el sistema de gráficas con los 5 colores data-viz", C.chartPurple],
              ["6", "Aplica glow y glassmorphism como capa final", C.eB],
            ].map(([num, text, color]) => (
              <div key={num} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                marginBottom: 8, paddingBottom: 8,
                borderBottom: `1px solid ${C.bLight}`,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  backgroundColor: C.eM, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 9, fontWeight: 700, color,
                  ...neoShadow(0.7),
                }}>{num}</div>
                <span style={{ fontSize: 10, color: C.t2, lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </Card>

        </div>
      )}

    </div>
  );
}
