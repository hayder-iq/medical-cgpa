import { useState, useMemo, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ─── CURRICULUM DATA & IRAQI WEIGHT SYSTEM ──────────────────────────────────
const STAGES = [
  {
    id: 0, label: "1st", full: "First Stage", arabic: "المرحلة الأولى",
    color: "#60A5FA", weight: 5, // 5% of total CGPA
    subjects: [
      { en: "Anatomy",                    ar: "التشريح",                        u: 8   },
      { en: "Medical Biology",            ar: "الاحياء الطبية",                 u: 6   },
      { en: "Medical Chemistry",          ar: "الكيمياء الطبية",                u: 6   },
      { en: "Medical Physics",            ar: "الفيزياء الطبية",                u: 6   },
      { en: "English Language",           ar: "اللغة الانكليزية",               u: 4   },
      { en: "Computer Science",           ar: "الحاسبات",                       u: 3   },
      { en: "Medical Terminology",        ar: "المصطلحات الطبية",               u: 2   },
      { en: "Basics of Medicine",         ar: "اساسيات الطب",                   u: 2   },
      { en: "Democracy & Human Rights",   ar: "الديمقراطية وحقوق الانسان",      u: 2   },
    ],
  },
  {
    id: 1, label: "2nd", full: "Second Stage", arabic: "المرحلة الثانية",
    color: "#A78BFA", weight: 5, // 5% of total CGPA
    subjects: [
      { en: "Physiology",         ar: "فسلجة",                  u: 13 },
      { en: "Anatomy",            ar: "التشريح",                 u: 10 },
      { en: "Biochemistry",       ar: "الكيمياء الحياتية",       u: 8  },
      { en: "Histology",          ar: "الانسجة",                 u: 6  },
      { en: "Embryology",         ar: "الاجنة",                  u: 2  },
      { en: "Baath Party Crimes", ar: "جرائم حزب البعث",         u: 2  },
    ],
  },
  {
    id: 2, label: "3rd", full: "Third Stage", arabic: "المرحلة الثالثة",
    color: "#F87171", weight: 5, // 5% of total CGPA
    subjects: [
      { en: "Pathology",          ar: "الامراض",                  u: 11 },
      { en: "Microbiology",       ar: "الجراثيم",                 u: 9  },
      { en: "Pharmacology",       ar: "الادوية",                  u: 8  },
      { en: "Parasitology",       ar: "الطفيليات",                u: 5  },
      { en: "Internal Medicine",  ar: "الطب الباطني",             u: 5  },
      { en: "Community Medicine", ar: "طب الاسرة والمجتمع",       u: 3  },
      { en: "Surgery",            ar: "الجراحة",                  u: 2  },
    ],
  },
  {
    id: 3, label: "4th", full: "Fourth Stage", arabic: "المرحلة الرابعة",
    color: "#FBBF24", weight: 20, // 20% of total CGPA
    subjects: [
      { en: "Medicine",               ar: "الطب الباطني",           u: 13 },
      { en: "Surgery",                ar: "الجراحة",                u: 11 },
      { en: "Community Medicine",     ar: "طب الاسرة والمجتمع",     u: 11 },
      { en: "Obstetrics",             ar: "التوليد",                u: 6  },
      { en: "Forensic Medicine",      ar: "الطب العدلي",            u: 6  },
      { en: "Pediatrics",             ar: "طب الاطفال",             u: 2  },
      { en: "Medical Ethics",         ar: "اخلاقيات المهنة",        u: 2  },
      { en: "Psychology",             ar: "علم النفس",              u: 2  },
    ],
  },
  {
    id: 4, label: "5th", full: "Fifth Stage", arabic: "المرحلة الخامسة",
    color: "#34D399", weight: 25, // 25% of total CGPA
    subjects: [
      { en: "Internal Medicine",  ar: "الطب الباطني",           u: 7   },
      { en: "Minor Surgery",      ar: "جراحات فرعية",           u: 6   },
      { en: "Gynecology",         ar: "النسائية",               u: 5.5 },
      { en: "Pediatrics",         ar: "طب الاطفال",             u: 5.5 },
      { en: "Psychiatry",         ar: "الطب النفسي",            u: 4.5 },
      { en: "Orthopedics",        ar: "الكسور",                 u: 4.5 },
      { en: "Dermatology",        ar: "الامراض الجلدية",        u: 3.5 },
      { en: "Radiology",          ar: "الاشعة",                 u: 3   },
      { en: "ENT",                ar: "الانف والاذن والحنجرة",   u: 3   },
      { en: "Ophthalmology",      ar: "العيون",                 u: 3   },
    ],
  },
  {
    id: 5, label: "6th", full: "Sixth Stage", arabic: "المرحلة السادسة",
    color: "#22D3EE", weight: 40, // 40% of total CGPA
    subjects: [
      { en: "Internal Medicine (Rotation)", ar: "طب باطني",   u: 12 },
      { en: "Surgery (Rotation)",           ar: "جراحة",      u: 12 },
      { en: "Gynecology (Rotation)",        ar: "نسائية",     u: 12 },
      { en: "Pediatrics (Rotation)",        ar: "طب الاطفال", u: 12 },
    ],
  },
];

const TOTAL_UNITS = STAGES.reduce((acc, stage) => acc + stage.subjects.reduce((a, s) => a + s.u, 0), 0);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const classify = (g) => {
  if (g == null || g === 0) return null;
  if (g >= 90) return { label: "Excellent",   ar: "امتياز",   color: "#10B981" };
  if (g >= 80) return { label: "Very Good",   ar: "جيد جداً", color: "#60A5FA" };
  if (g >= 70) return { label: "Good",        ar: "جيد",      color: "#A78BFA" };
  if (g >= 60) return { label: "Medium",      ar: "متوسط",    color: "#FBBF24" };
  if (g >= 50) return { label: "Acceptable",  ar: "مقبول",    color: "#F97316" };
  return             { label: "Fail",         ar: "راسب",     color: "#EF4444" };
};

const gradeColor = (g) => {
  if (g == null) return null;
  if (g >= 90) return "#10B981";
  if (g >= 80) return "#60A5FA";
  if (g >= 70) return "#A78BFA";
  if (g >= 60) return "#FBBF24";
  if (g >= 50) return "#F97316";
  return "#EF4444";
};

const gpa4 = (avg) => Math.min(4, avg / 25).toFixed(2);

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function MedIQPro() {
  const [grades,      setGrades     ] = useState({});
  const [activeStage, setActiveStage] = useState(0);
  const [targetAvg,   setTargetAvg  ] = useState(85);
  const [dark,        setDark       ] = useState(true);
  const [tab,         setTab        ] = useState("grades"); // "grades" | "details" | "insights"

  // ── Persistence ──────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("medical-cgpa-v15");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.grades)     setGrades(d.grades);
        if (d.targetAvg)  setTargetAvg(d.targetAvg);
        if (d.dark != null) setDark(d.dark);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    localStorage.setItem("medical-cgpa-v15", JSON.stringify({ grades, targetAvg, dark }));
  }, [grades, targetAvg, dark]);

  // ── Grade setter ──────────────────────────────────────────────────────────
  const setGrade = useCallback((sid, idx, raw) => {
    const key = `${sid}-${idx}`;
    setGrades(prev => {
      if (raw === "" || raw == null) { const n = {...prev}; delete n[key]; return n; }
      const v = parseFloat(raw);
      return isNaN(v) ? prev : {...prev, [key]: Math.min(100, Math.max(0, v))};
    });
  }, []);

  // ── Advanced Weighted Metrics (Iraqi 5/5/5/20/25/40 System) ───────────────
  const metrics = useMemo(() => {
    let cgpaWeightedSum = 0;
    let gradedWeights = 0;
    let gradedU = 0;

    const perStage = STAGES.map(stage => {
      let sW = 0, sU = 0;
      stage.subjects.forEach((sub, i) => {
        const g = grades[`${stage.id}-${i}`];
        if (g != null) { sW += g * sub.u; sU += sub.u; }
      });
      
      const stageTotal = stage.subjects.reduce((a, s) => a + s.u, 0);
      const pct = sU / stageTotal;
      const avg = sU > 0 ? sW / sU : null;

      // Apply the Iraqi percentage weight based on how much of the stage is graded
      if (avg != null) {
        const activeWeight = stage.weight * pct;
        cgpaWeightedSum += avg * activeWeight;
        gradedWeights += activeWeight;
      }

      gradedU += sU;
      return { avg, gradedU: sU, totalU: stageTotal, pct };
    });

    const cgpa = gradedWeights > 0 ? cgpaWeightedSum / gradedWeights : 0;
    
    // Calculate what's needed for the target
    const remainW = 100 - gradedWeights;
    const needed  = remainW > 0 ? (targetAvg * 100 - cgpaWeightedSum) / remainW : null;
    const cls     = classify(cgpa);
    
    return { cgpa, gpa4: gpa4(cgpa), cls, perStage, gradedU, remainW, needed };
  }, [grades, targetAvg]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const T = dark
    ? { bg:"#07090F", card:"#0E1525", border:"rgba(255,255,255,0.07)",
        text:"#E2E8F0", muted:"rgba(226,232,240,0.38)", sub:"#1B263B" }
    : { bg:"#EFF2F7", card:"#FFFFFF",  border:"rgba(0,0,0,0.08)",
        text:"#111827", muted:"rgba(17,24,39,0.45)",    sub:"#F1F5F9" };

  const stage = STAGES[activeStage];
  const sm    = metrics.perStage[activeStage];

  const radarData = stage.subjects.map((sub, i) => ({
    s: sub.en.length > 11 ? sub.en.slice(0, 11) + "…" : sub.en,
    g: grades[`${stage.id}-${i}`] ?? 0,
  }));

  const barData = STAGES.map((s, i) => ({
    label: s.label,
    avg: metrics.perStage[i].avg ?? 0,
    color: s.color,
  }));

  const allGraded = STAGES.flatMap((s, si) =>
    s.subjects.map((sub, i) => {
      const g = grades[`${s.id}-${i}`];
      return g != null ? { en: sub.en, ar: sub.ar, g, u: sub.u, stage: s.label, color: s.color } : null;
    }).filter(Boolean)
  );
  const best  = allGraded.length ? allGraded.reduce((a, b) => b.g > a.g ? b : a) : null;
  const worst = allGraded.length ? allGraded.reduce((a, b) => b.g < a.g ? b : a) : null;
  const failing = allGraded.filter(x => x.g < 50);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text,
                  fontFamily:"'Outfit','DM Sans',system-ui,sans-serif",
                  transition:"background 0.3s,color 0.3s" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .mediq-card{transition:border-color 0.2s}
        .mediq-row:hover{background:rgba(255,255,255,0.03)}
        .mediq-tab:hover{opacity:1!important}
        .mediq-btn:hover{opacity:0.85}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.35s ease forwards}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position:"sticky", top:0, zIndex:100,
        background: dark ? "rgba(7,9,15,0.92)" : "rgba(239,242,247,0.92)",
        backdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}`,
        padding:"0 28px", display:"flex", alignItems:"center",
        justifyContent:"space-between", height:64,
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{
            width:40,height:40,borderRadius:12,flexShrink:0,
            background:"linear-gradient(135deg,#00D4AA,#3B82F6)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:18,fontFamily:"'Bebas Neue'",color:"white",letterSpacing:1,
          }}>CG</div>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:19,letterSpacing:3,lineHeight:1}}>
              CUMULATIVE AVERAGE
            </div>
            <div style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono'",letterSpacing:1.5,marginTop:2}}>
              UNIVERSITY OF WARITH AL-ANBIYAA · DEV: HAIDER EMAD
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{display:"flex",gap:4}}>
          {[["grades","Grades"],["details","View in Details"],["insights","Insights"]].map(([k,l]) => (
            <button key={k} className="mediq-btn"
              onClick={() => setTab(k)}
              style={{
                padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",
                fontFamily:"'Outfit'",fontWeight:600,fontSize:12,letterSpacing:0.5,
                transition:"all 0.2s",
                background: tab===k ? (dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)") : "transparent",
                color: tab===k ? T.text : T.muted,
              }}>{l}</button>
          ))}
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:8}}>
          <button className="mediq-btn" onClick={() => setDark(!dark)} style={{
            padding:"8px 16px",borderRadius:10,border:`1px solid ${T.border}`,
            background:"transparent",color:T.text,cursor:"pointer",
            fontSize:12,fontFamily:"'Outfit'",fontWeight:600,
          }}>{dark ? "☀ Light" : "☾ Dark"}</button>
          <button className="mediq-btn" onClick={() => { if(window.confirm("Reset all grades?")) setGrades({}); }} style={{
            padding:"8px 16px",borderRadius:10,border:"1px solid rgba(239,68,68,0.3)",
            background:"rgba(239,68,68,0.06)",color:"#F87171",cursor:"pointer",
            fontSize:12,fontFamily:"'Outfit'",fontWeight:600,
          }}>Reset</button>
        </div>
      </header>

      {/* ── METRICS STRIP ── */}
      <div style={{
        padding:"20px 28px",borderBottom:`1px solid ${T.border}`,
        display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16,
      }}>
        {/* CGPA */}
        <div style={{
          background:`linear-gradient(135deg,rgba(0,212,170,0.12),rgba(59,130,246,0.08))`,
          border:"1px solid rgba(0,212,170,0.25)",borderRadius:18,padding:"18px 22px",
        }}>
          <div style={{fontSize:10,color:"#00D4AA",fontWeight:700,letterSpacing:2,marginBottom:6}}>
            MEDICAL CGPA
          </div>
          <div style={{fontSize:56,lineHeight:1,fontFamily:"'Bebas Neue'",color:"#00D4AA",letterSpacing:2}}>
            {metrics.cgpa.toFixed(2)}
          </div>
          <div style={{fontSize:10,color:T.muted,marginTop:6,fontFamily:"'JetBrains Mono'"}}>/ 100</div>
        </div>

        {/* GPA 4.0 */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"18px 22px"}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:6}}>GPA / 4.0</div>
          <div style={{fontSize:48,lineHeight:1,fontFamily:"'Bebas Neue'",color:"#60A5FA",letterSpacing:2}}>
            {metrics.gpa4}
          </div>
          <div style={{fontSize:10,color:T.muted,marginTop:6}}>International scale</div>
        </div>

        {/* Classification */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"18px 22px"}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:8}}>GRADE CLASS</div>
          <div style={{fontSize:24,fontWeight:800,color:metrics.cls?.color ?? T.muted,lineHeight:1.1}}>
            {metrics.cls?.label ?? "—"}
          </div>
          <div style={{fontSize:16,color:metrics.cls?.color ?? T.muted,direction:"rtl",textAlign:"left",marginTop:4,opacity:0.8}}>
            {metrics.cls?.ar ?? "أدخل الدرجات"}
          </div>
        </div>

        {/* Units */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"18px 22px"}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:8}}>UNITS GRADED</div>
          <div style={{fontSize:28,fontWeight:800,fontFamily:"'JetBrains Mono'"}}>
            {metrics.gradedU % 1 === 0 ? metrics.gradedU : metrics.gradedU.toFixed(1)}
            <span style={{fontSize:13,color:T.muted,fontWeight:400}}> / {TOTAL_UNITS}</span>
          </div>
          <div style={{height:5,background:dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",
                        borderRadius:3,marginTop:12,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,transition:"width 0.6s ease",
                         background:"linear-gradient(90deg,#00D4AA,#3B82F6)",
                         width:`${(metrics.gradedU/TOTAL_UNITS)*100}%`}} />
          </div>
        </div>

        {/* Target */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:"18px 22px"}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:8}}>TARGET GOAL</div>
          <input type="number" min={50} max={100} step={0.5} value={targetAvg}
            onChange={e => setTargetAvg(parseFloat(e.target.value)||0)}
            style={{
              width:"100%",background:"transparent",border:"none",outline:"none",
              fontSize:32,fontFamily:"'Bebas Neue'",letterSpacing:2,color:T.text,
            }} />
          {metrics.needed != null && (
            <div style={{
              fontSize:11,fontWeight:700,marginTop:4,
              color: metrics.needed < 0 ? "#10B981" : metrics.needed > 100 ? "#EF4444" : "#FBBF24",
            }}>
              {metrics.needed < 0
                ? "✓ Target achieved!"
                : metrics.needed > 100
                ? "✗ Not achievable"
                : `Need ${metrics.needed.toFixed(1)} avg in remaining`}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           TAB: GRADES
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "grades" && (
        <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:0,minHeight:"calc(100vh - 200px)"}}>

          {/* Stage sidebar */}
          <div style={{
            borderRight:`1px solid ${T.border}`,padding:16,
            display:"flex",flexDirection:"column",gap:4,
          }}>
            {STAGES.map((s, idx) => {
              const sm = metrics.perStage[idx];
              const active = activeStage === idx;
              return (
                <button key={idx} className="mediq-tab" onClick={() => setActiveStage(idx)} style={{
                  width:"100%",textAlign:"left",padding:"12px 14px",
                  borderRadius:12,border:"none",cursor:"pointer",
                  background: active ? `${s.color}15` : "transparent",
                  borderLeft: `3px solid ${active ? s.color : "transparent"}`,
                  transition:"all 0.2s", opacity: active ? 1 : 0.55,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:active?s.color:T.text,
                                    fontFamily:"'Bebas Neue'",letterSpacing:1.5}}>
                        {s.full}
                      </div>
                      <div style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono'",marginTop:2}}>
                        {s.weight}% Weight
                      </div>
                    </div>
                    {sm.avg != null && (
                      <div style={{fontSize:18,fontWeight:900,fontFamily:"'Bebas Neue'",
                                    color:gradeColor(sm.avg),letterSpacing:1}}>
                        {sm.avg.toFixed(1)}
                      </div>
                    )}
                  </div>
                  {sm.gradedU > 0 && (
                    <div style={{height:2,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)",
                                  borderRadius:1,marginTop:8,overflow:"hidden"}}>
                      <div style={{height:"100%",background:s.color,borderRadius:1,
                                    width:`${sm.pct*100}%`,transition:"width 0.4s"}} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stage content */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:0}}>

            {/* Subject inputs */}
            <div key={activeStage} className="fade-up"
              style={{padding:28,borderRight:`1px solid ${T.border}`,overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3,color:stage.color}}>
                    {stage.full}
                  </div>
                  <div style={{fontSize:14,color:T.muted,direction:"rtl",textAlign:"left",marginTop:3}}>
                    {stage.arabic} — {stage.weight}% من المعدل التراكمي
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  {sm.avg != null ? (
                    <>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:52,lineHeight:1,
                                    color:gradeColor(sm.avg),letterSpacing:2}}>
                        {sm.avg.toFixed(2)}
                      </div>
                      <div style={{fontSize:11,color:classify(sm.avg)?.color,fontWeight:700,marginTop:2}}>
                        {classify(sm.avg)?.label} · {classify(sm.avg)?.ar}
                      </div>
                    </>
                  ) : (
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:40,color:T.muted,letterSpacing:2}}>
                      ——
                    </div>
                  )}
                </div>
              </div>

              {/* Subject rows */}
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {stage.subjects.map((sub, i) => {
                  const key  = `${stage.id}-${i}`;
                  const g    = grades[key];
                  const cls  = classify(g);
                  const gc   = gradeColor(g);
                  return (
                    <div key={i} className="mediq-row" style={{
                      display:"flex",alignItems:"center",gap:12,
                      padding:"10px 14px",borderRadius:12,transition:"all 0.15s",
                      background: g != null ? `${gc}0A` : "transparent",
                    }}>
                      {/* Unit pill */}
                      <div style={{
                        width:36,height:22,borderRadius:6,flexShrink:0,
                        background:`${stage.color}20`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,fontWeight:700,color:stage.color,
                        fontFamily:"'JetBrains Mono'",
                      }}>{sub.u}</div>

                      {/* Names */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600}}>{sub.en}</div>
                        <div style={{fontSize:10,color:T.muted,direction:"rtl",textAlign:"left",marginTop:1}}>
                          {sub.ar}
                        </div>
                      </div>

                      {/* Classification badge */}
                      {cls && (
                        <div style={{
                          fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:6,
                          background:`${cls.color}18`,color:cls.color,letterSpacing:0.5,
                          flexShrink:0,
                        }}>{cls.label}</div>
                      )}

                      {/* Grade input */}
                      <input type="number" min={0} max={100} step={0.5}
                        placeholder="—"
                        value={g ?? ""}
                        onChange={e => setGrade(stage.id, i, e.target.value)}
                        style={{
                          width:64,height:38,textAlign:"center",borderRadius:10,
                          background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                          border:`1.5px solid ${g!=null ? gc+"60" : T.border}`,
                          color: g!=null ? gc : T.text,
                          fontSize:15,fontWeight:800,fontFamily:"'JetBrains Mono'",outline:"none",
                          transition:"all 0.2s",
                        }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right panel: Radar + mini-insights */}
            <div style={{padding:28,display:"flex",flexDirection:"column",gap:24}}>
              <div>
                <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:16}}>
                  STAGE RADAR
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{top:10,right:10,bottom:10,left:10}}>
                    <PolarGrid stroke={dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.1)"} />
                    <PolarAngleAxis dataKey="s"
                      tick={{fontSize:9,fill:T.muted,fontFamily:"'Outfit'"}} />
                    <Radar name="Grade" dataKey="g"
                      stroke={stage.color} fill={stage.color} fillOpacity={0.18} strokeWidth={2} />
                    <Tooltip contentStyle={{
                      background:T.card,border:`1px solid ${T.border}`,
                      borderRadius:10,fontSize:12,color:T.text,
                    }} formatter={v => [v||"—","Grade"]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Stage mini-stats */}
              <div style={{background:T.sub,borderRadius:16,padding:18}}>
                <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:14}}>
                  STAGE BREAKDOWN
                </div>
                {(() => {
                  const items = stage.subjects.map((s,i)=>({...s,g:grades[`${stage.id}-${i}`]}))
                                              .filter(s=>s.g!=null);
                  if (!items.length) return (
                    <div style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>
                      Enter grades to see breakdown
                    </div>
                  );
                  const best  = items.reduce((a,b)=>b.g>a.g?b:a);
                  const worst = items.reduce((a,b)=>b.g<a.g?b:a);
                  return (
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <Row label="↑ Best subject"    val={best.en}          color="#10B981" muted={T.muted} />
                      <Row label="↓ Weakest subject" val={worst.en}         color="#FBBF24" muted={T.muted} />
                      <Row label="Subjects graded"   val={`${items.length} / ${stage.subjects.length}`} color={T.text} muted={T.muted} />
                      <Row label="Stage classification" val={classify(sm.avg)?.label??""} color={classify(sm.avg)?.color??T.muted} muted={T.muted} />
                    </div>
                  );
                })()}
              </div>

              {/* Stage comparison bar */}
              <div>
                <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>
                  ALL STAGES
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={barData} barCategoryGap="30%"
                    margin={{top:0,right:0,bottom:0,left:-20}}>
                    <CartesianGrid strokeDasharray="3 3"
                      stroke={dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.07)"} vertical={false} />
                    <XAxis dataKey="label" tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} tick={{fontSize:9,fill:T.muted,fontFamily:"'JetBrains Mono'"}}
                      axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,
                      borderRadius:10,fontSize:11,color:T.text}}
                      formatter={v=>[v?v.toFixed(1):"—","Avg"]} />
                    <Bar dataKey="avg" radius={[5,5,0,0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={STAGES[i].color}
                          fillOpacity={activeStage===i?1:0.4} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           TAB: DETAILS VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "details" && (
        <div style={{padding:32}} className="fade-up">
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:4,marginBottom:6}}>
              VIEW IN DETAILS
            </div>
            <div style={{fontSize:12,color:T.muted,maxWidth:600}}>
              Visual fingerprint of your entire 6-year medical education.
              Each block represents one subject — width proportional to credit units, color reflects grade.
              Click any block to jump to that stage.
            </div>
          </div>

          {/* Legend */}
          <div style={{display:"flex",gap:20,marginBottom:28,flexWrap:"wrap"}}>
            {[["≥90 Excellent","#10B981"],["≥80 Very Good","#60A5FA"],
              ["≥70 Good","#A78BFA"],["≥60 Medium","#FBBF24"],
              ["≥50 Acceptable","#F97316"],["<50 Fail","#EF4444"],
              ["Not entered","rgba(255,255,255,0.08)"]].map(([l,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:T.muted}}>
                <div style={{width:10,height:10,borderRadius:3,background:c,flexShrink:0}} />
                {l}
              </div>
            ))}
          </div>

          {/* DNA strands */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {STAGES.map((s, si) => {
              const stageTotal = s.subjects.reduce((a,x)=>a+x.u,0);
              return (
                <div key={si} style={{display:"flex",alignItems:"center",gap:16}}>
                  {/* Stage label */}
                  <div style={{
                    width:110,flexShrink:0,textAlign:"right",
                    fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:s.color,
                  }}>
                    <div>{s.full}</div>
                    <div style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono'",letterSpacing:1}}>
                      {s.weight}% Weight
                    </div>
                  </div>

                  {/* Subject blocks */}
                  <div style={{display:"flex",gap:3,flex:1,overflowX:"auto",paddingBottom:4}}>
                    {s.subjects.map((sub, i) => {
                      const g  = grades[`${s.id}-${i}`];
                      const gc = g != null ? gradeColor(g) : null;
                      const w  = Math.max(28, sub.u * 16);
                      return (
                        <div key={i}
                          title={`${sub.en} (${sub.u} units)${g!=null?`: ${g}`:" — not entered"}`}
                          onClick={() => { setActiveStage(si); setTab("grades"); }}
                          style={{
                            width:w, height:48, borderRadius:8, flexShrink:0,
                            background: gc ? gc : (dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.06)"),
                            border:`1px solid ${gc?gc+"40":T.border}`,
                            cursor:"pointer",
                            display:"flex",flexDirection:"column",
                            alignItems:"center",justifyContent:"center",gap:2,
                            transition:"transform 0.15s,opacity 0.15s",
                            opacity: g!=null ? 0.92 : 0.45,
                          }}
                          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                        >
                          {g != null && (
                            <span style={{
                              fontSize:10,fontWeight:900,color:"white",
                              fontFamily:"'JetBrains Mono'",
                              textShadow:"0 1px 4px rgba(0,0,0,0.6)",
                            }}>{g}</span>
                          )}
                          <span style={{
                            fontSize:7,color:g!=null?"rgba(255,255,255,0.7)":T.muted,
                            textAlign:"center",lineHeight:1.2,
                            fontFamily:"'Outfit'",fontWeight:500,
                            maxWidth:w-8,overflow:"hidden",
                          }}>
                            {sub.en.length > Math.floor(w/5) ? sub.en.slice(0,Math.floor(w/5))+"…" : sub.en}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stage avg pill */}
                  <div style={{
                    width:72,flexShrink:0,textAlign:"center",
                    background: metrics.perStage[si].avg != null
                      ? `${gradeColor(metrics.perStage[si].avg)}18`
                      : T.sub,
                    border:`1px solid ${metrics.perStage[si].avg!=null?gradeColor(metrics.perStage[si].avg)+"40":T.border}`,
                    borderRadius:10,padding:"8px 10px",
                  }}>
                    <div style={{
                      fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1,
                      color: metrics.perStage[si].avg!=null ? gradeColor(metrics.perStage[si].avg) : T.muted,
                    }}>
                      {metrics.perStage[si].avg?.toFixed(1) ?? "—"}
                    </div>
                    <div style={{fontSize:8,color:T.muted,fontWeight:600}}>AVG</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          <div style={{
            marginTop:32,padding:24,background:T.card,border:`1px solid ${T.border}`,
            borderRadius:20,display:"flex",justifyContent:"space-around",alignItems:"center",
          }}>
            <Stat label="Total Subjects" value={STAGES.reduce((a,s)=>a+s.subjects.length,0)} color={T.text} />
            <Stat label="Total Units"    value={TOTAL_UNITS} color={T.text} />
            <Stat label="Graded Units"   value={`${metrics.gradedU%1===0?metrics.gradedU:metrics.gradedU.toFixed(1)} / ${TOTAL_UNITS}`} color="#00D4AA" />
            <Stat label="Completion"     value={`${((metrics.gradedU/TOTAL_UNITS)*100).toFixed(1)}%`} color="#60A5FA" />
            <Stat label="Overall CGPA"   value={metrics.cgpa.toFixed(2)} color={gradeColor(metrics.cgpa)??T.muted} />
            <Stat label="Classification" value={metrics.cls?.label ?? "—"} color={metrics.cls?.color ?? T.muted} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           TAB: INSIGHTS
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "insights" && (
        <div style={{padding:32,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}} className="fade-up">

          {/* Academic profile */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:28}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:20}}>
              ACADEMIC INTELLIGENCE PROFILE
            </div>
            {allGraded.length === 0 ? (
              <div style={{fontSize:13,color:T.muted,fontStyle:"italic"}}>
                Enter some grades in the Grades tab to generate insights.
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <InsightRow icon="🏆" label="Highest Grade"
                  value={best ? `${best.en} — ${best.g}` : "—"}
                  sub={best ? `${best.stage} · ${best.u} units` : ""}
                  color="#10B981" T={T} />
                <InsightRow icon="📉" label="Lowest Grade"
                  value={worst ? `${worst.en} — ${worst.g}` : "—"}
                  sub={worst ? `${worst.stage} · ${worst.u} units` : ""}
                  color="#FBBF24" T={T} />
                <InsightRow icon="📊" label="Subjects Graded"
                  value={`${allGraded.length} of ${STAGES.reduce((a,s)=>a+s.subjects.length,0)}`}
                  sub={`${((allGraded.length/STAGES.reduce((a,s)=>a+s.subjects.length,0))*100).toFixed(0)}% of curriculum entered`}
                  color="#60A5FA" T={T} />
                {failing.length > 0 && (
                  <InsightRow icon="⚠️" label={`${failing.length} Failing Subject${failing.length>1?"s":""}`}
                    value={failing.map(f=>f.en).join(", ")}
                    sub="Subjects below 50 — requires attention"
                    color="#EF4444" T={T} />
                )}
                <InsightRow icon="🎯" label="Best Stage"
                  value={(() => {
                    const avgs = metrics.perStage.map((p,i)=>({avg:p.avg,name:STAGES[i].full}));
                    const valid = avgs.filter(a=>a.avg!=null);
                    if(!valid.length) return "—";
                    const best = valid.reduce((a,b)=>b.avg>a.avg?b:a);
                    return `${best.name} — ${best.avg.toFixed(2)}`;
                  })()}
                  sub="Stage with highest average"
                  color="#34D399" T={T} />
              </div>
            )}
          </div>

          {/* Target deep dive */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:28}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:20}}>
              TARGET CALCULATOR
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,color:T.muted,marginBottom:8}}>Set your graduation target average</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[50,60,70,80,90,95].map(v=>(
                  <button key={v} onClick={()=>setTargetAvg(v)} className="mediq-btn" style={{
                    padding:"8px 16px",borderRadius:10,border:`1px solid ${targetAvg===v?gradeColor(v)+"80":T.border}`,
                    background: targetAvg===v ? `${gradeColor(v)}15` : "transparent",
                    color: targetAvg===v ? gradeColor(v) : T.muted,
                    fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'JetBrains Mono'",
                  }}>{v}</button>
                ))}
              </div>
            </div>

            <div style={{
              padding:20,borderRadius:16,marginBottom:20,
              background: metrics.needed==null ? T.sub
                : metrics.needed < 0   ? "rgba(16,185,129,0.1)"
                : metrics.needed > 100 ? "rgba(239,68,68,0.1)"
                : "rgba(251,191,36,0.1)",
              border: `1px solid ${
                metrics.needed==null ? T.border
                : metrics.needed < 0   ? "rgba(16,185,129,0.3)"
                : metrics.needed > 100 ? "rgba(239,68,68,0.3)"
                : "rgba(251,191,36,0.3)"}`,
            }}>
              <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:8}}>
                REQUIRED AVERAGE IN REMAINING {metrics.remainW.toFixed(0)}% WEIGHT
              </div>
              <div style={{
                fontFamily:"'Bebas Neue'",fontSize:56,letterSpacing:3,lineHeight:1,
                color: metrics.needed==null ? T.muted
                  : metrics.needed < 0   ? "#10B981"
                  : metrics.needed > 100 ? "#EF4444"
                  : "#FBBF24",
              }}>
                {metrics.needed == null ? "——"
                  : metrics.needed < 0   ? "ACHIEVED ✓"
                  : metrics.needed > 100 ? "IMPOSSIBLE"
                  : metrics.needed.toFixed(2)}
              </div>
              {metrics.needed != null && metrics.needed >= 0 && metrics.needed <= 100 && (
                <div style={{fontSize:12,color:T.muted,marginTop:8}}>
                  You need a {metrics.needed.toFixed(1)} average across the remaining curriculum 
                  ({metrics.remainW.toFixed(0)}% of your degree) to reach {targetAvg}.
                </div>
              )}
            </div>

            {/* Per-stage progress */}
            <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:14}}>
              STAGE-BY-STAGE PROGRESS
            </div>
            {STAGES.map((s,i)=>{
              const sp = metrics.perStage[i];
              return (
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11}}>
                    <span style={{color:T.text,fontWeight:600}}>{s.full} <span style={{opacity:0.5}}>({s.weight}%)</span></span>
                    <span style={{color:sp.avg!=null?gradeColor(sp.avg):T.muted,
                                    fontFamily:"'JetBrains Mono'",fontWeight:700}}>
                      {sp.avg!=null ? `${sp.avg.toFixed(1)} — ${classify(sp.avg)?.label}` : "Not graded"}
                    </span>
                  </div>
                  <div style={{height:6,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",
                                borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:3,transition:"width 0.5s",
                                  background:sp.avg!=null?gradeColor(sp.avg):T.border,
                                  width:`${sp.pct*100}%`}} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Iraqi grading scale */}
          <div style={{
            gridColumn:"span 2",
            background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:28,
          }}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:20}}>
              IRAQI MEDICAL GRADING SCALE — الجامعات العراقية
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
              {[
                {range:"90–100",label:"Excellent",ar:"امتياز",  color:"#10B981"},
                {range:"80–89", label:"Very Good", ar:"جيد جداً",color:"#60A5FA"},
                {range:"70–79", label:"Good",       ar:"جيد",    color:"#A78BFA"},
                {range:"60–69", label:"Medium",     ar:"متوسط",  color:"#FBBF24"},
                {range:"50–59", label:"Acceptable", ar:"مقبول",  color:"#F97316"},
                {range:"<50",   label:"Fail",       ar:"راسب",   color:"#EF4444"},
              ].map(g=>(
                <div key={g.label} style={{
                  padding:"16px 14px",borderRadius:14,textAlign:"center",
                  background:`${g.color}12`,border:`1px solid ${g.color}30`,
                }}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:g.color,letterSpacing:1}}>
                    {g.range}
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginTop:4}}>{g.label}</div>
                  <div style={{fontSize:14,color:g.color,marginTop:2}}>{g.ar}</div>
                  {metrics.cgpa > 0 && (
                    <div style={{marginTop:8,height:3,borderRadius:2,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",overflow:"hidden"}}>
                      {classify(metrics.cgpa)?.label === g.label && (
                        <div style={{height:"100%",background:g.color,borderRadius:2}} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{
        borderTop:`1px solid ${T.border}`,padding:"16px 28px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
      }}>
        <div style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono'",letterSpacing:2}}>
          CUMULATIVE AVERAGE · UNIVERSITY OF WARITH AL-ANBIYAA · DEV: HAIDER EMAD
        </div>
        <div style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono'"}}>
          {STAGES.reduce((a,s)=>a+s.subjects.length,0)} SUBJECTS · {TOTAL_UNITS} TOTAL UNITS · 6 STAGES
        </div>
      </footer>
    </div>
  );
}

// ─── Small helper components ─────────────────────────────────────────────────
function Row({ label, val, color, muted }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}>
      <span style={{color:muted}}>{label}</span>
      <span style={{color,fontWeight:700}}>{val}</span>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,color,lineHeight:1}}>
        {value}
      </div>
      <div style={{fontSize:9,color:"rgba(226,232,240,0.4)",fontWeight:700,
                    letterSpacing:1.5,marginTop:6,textTransform:"uppercase"}}>
        {label}
      </div>
    </div>
  );
}

function InsightRow({ icon, label, value, sub, color, T }) {
  return (
    <div style={{
      display:"flex",gap:14,alignItems:"flex-start",padding:"14px 16px",
      borderRadius:14,background:T.sub,
    }}>
      <div style={{fontSize:20,flexShrink:0,lineHeight:1.2}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>
          {label.toUpperCase()}
        </div>
        <div style={{fontSize:13,fontWeight:700,color,marginBottom:2}}>{value}</div>
        {sub && <div style={{fontSize:11,color:T.muted}}>{sub}</div>}
      </div>
    </div>
  );
}