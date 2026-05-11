import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ─── CURRICULUM DATA & UPDATED WEIGHT SYSTEM ──────────────────────────────────
const STAGES = [
  {
    id: 0, label: "1st", full: "First Stage", arabic: "المرحلة الأولى",
    color: "#60A5FA", weight: 5,
    subjects: [
      { en: "Anatomy", ar: "التشريح", u: 8 },
      { en: "Medical Biology", ar: "الاحياء الطبية", u: 6 },
      { en: "Medical Chemistry", ar: "الكيمياء الطبية", u: 6 },
      { en: "Medical Physics", ar: "الفيزياء الطبية", u: 6 },
      { en: "English Language", ar: "اللغة الانكليزية", u: 4 },
      { en: "Computer Science", ar: "الحاسبات", u: 3 },
      { en: "Medical Terminology", ar: "المصطلحات الطبية", u: 2 },
      { en: "Basics of Medicine", ar: "اساسيات الطب", u: 2 },
      { en: "Democracy & Human Rights", ar: "الديمقراطية وحقوق الانسان", u: 2 },
    ],
  },
  {
    id: 1, label: "2nd", full: "Second Stage", arabic: "المرحلة الثانية",
    color: "#A78BFA", weight: 5,
    subjects: [
      { en: "Physiology", ar: "فسلجة", u: 13 },
      { en: "Anatomy", ar: "التشريح", u: 10 },
      { en: "Biochemistry", ar: "الكيمياء الحياتية", u: 8 },
      { en: "Histology", ar: "الانسجة", u: 6 },
      { en: "Embryology", ar: "الاجنة", u: 2 },
      { en: "Baath Party Crimes", ar: "جرائم حزب البعث", u: 2 },
    ],
  },
  {
    id: 2, label: "3rd", full: "Third Stage", arabic: "المرحلة الثالثة",
    color: "#F87171", weight: 5,
    subjects: [
      { en: "Pathology", ar: "الامراض", u: 11 },
      { en: "Microbiology", ar: "الجراثيم", u: 9 },
      { en: "Pharmacology", ar: "الادوية", u: 8 },
      { en: "Parasitology", ar: "الطفيليات", u: 5 },
      { en: "Internal Medicine", ar: "الطب الباطني", u: 5 },
      { en: "Community Medicine", ar: "طب المجتمع", u: 3 },
      { en: "Surgery", ar: "الجراحة", u: 2 },
    ],
  },
  {
    id: 3, label: "4th", full: "Fourth Stage", arabic: "المرحلة الرابعة",
    color: "#FBBF24", weight: 20,
    subjects: [
      { en: "Medicine", ar: "الطب الباطني", u: 13 },
      { en: "Surgery", ar: "الجراحة", u: 11 },
      { en: "Community Medicine", ar: "طب المجتمع", u: 11 },
      { en: "Obstetrics", ar: "التوليد", u: 6 },
      { en: "Forensic Medicine", ar: "الطب العدلي", u: 6 },
      { en: "Paediatrics", ar: "طب الاطفال", u: 2 },
      { en: "Medical Ethics", ar: "اخلاقيات المهنة", u: 2 },
      { en: "Psychology", ar: "علم النفس", u: 2 },
    ],
  },
  {
    id: 4, label: "5th", full: "Fifth Stage", arabic: "المرحلة الخامسة",
    color: "#34D399", weight: 25,
    subjects: [
      { en: "Internal Medicine", ar: "الطب الباطني", u: 7 },
      { en: "Minor Surgery", ar: "جراحات فرعية", u: 6 },
      { en: "Gynecology", ar: "النسائية", u: 5.5 },
      { en: "Pediatrics", ar: "طب الاطفال", u: 5.5 },
      { en: "Psychiatry", ar: "الطب النفسي", u: 4.5 },
      { en: "Orthopedics", ar: "الكسور", u: 4.5 },
      { en: "Dermatology", ar: "الامراض الجلدية", u: 3.5 },
      { en: "Radiology", ar: "الاشعة", u: 3 },
      { en: "ENT", ar: "الانف والاذن والحنجرة", u: 3 },
      { en: "Ophthalmology", ar: "العيون", u: 3 },
    ],
  },
  {
    id: 5, label: "6th", full: "Sixth Stage", arabic: "المرحلة السادسة",
    color: "#22D3EE", weight: 40,
    subjects: [
      { en: "Internal Medicine (Rotation)", ar: "طب باطني", u: 12 },
      { en: "Surgery (Rotation)", ar: "جراحة", u: 12 },
      { en: "Gynecology (Rotation)", ar: "نسائية", u: 12 },
      { en: "Pediatrics (Rotation)", ar: "طب الاطفال", u: 12 },
    ],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const classify = (g) => {
  if (g == null || g === 0) return null;
  if (g >= 90) return { label: "Excellent", ar: "امتياز", color: "#10B981" };
  if (g >= 80) return { label: "Very Good", ar: "جيد جداً", color: "#60A5FA" };
  if (g >= 70) return { label: "Good", ar: "جيد", color: "#A78BFA" };
  if (g >= 60) return { label: "Medium", ar: "متوسط", color: "#FBBF24" };
  if (g >= 50) return { label: "Acceptable", ar: "مقبول", color: "#F97316" };
  return { label: "Fail", ar: "راسب", color: "#EF4444" };
};

export default function WarithMedGPA() {
  const [grades, setGrades] = useState({});
  const [activeStage, setActiveStage] = useState(0);
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("grades");

  // Load/Save
  useEffect(() => {
    const saved = localStorage.getItem("warith-med-v1");
    if (saved) setGrades(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("warith-med-v1", JSON.stringify(grades));
  }, [grades]);

  const setGrade = (sid, idx, raw) => {
    const key = `${sid}-${idx}`;
    const v = raw === "" ? null : Math.min(100, Math.max(0, parseFloat(raw)));
    setGrades(prev => {
      const n = { ...prev };
      if (v === null) delete n[key]; else n[key] = v;
      return n;
    });
  };

  const metrics = useMemo(() => {
    let cumulativeGPA = 0;
    const perStage = STAGES.map(stage => {
      let sW = 0, sU = 0;
      const stageTotalU = stage.subjects.reduce((a, s) => a + s.u, 0);
      
      const subjectCalcs = stage.subjects.map((sub, i) => {
        const g = grades[`${stage.id}-${i}`] || 0;
        // Contribution formula: (Grade * Units / StageTotalUnits) * (StageWeight / 100)
        const contrib = (g * sub.u / stageTotalU) * (stage.weight / 100);
        if (grades[`${stage.id}-${i}`] != null) {
          sW += grades[`${stage.id}-${i}`] * sub.u;
          sU += sub.u;
        }
        return { ...sub, contrib };
      });

      const avg = sU > 0 ? sW / sU : 0;
      cumulativeGPA += (avg * stage.weight / 100);

      return { avg, subjectCalcs, isComplete: sU === stageTotalU };
    });
    return { perStage, cumulativeGPA };
  }, [grades]);

  const T = dark 
    ? { bg: "#0F172A", card: "#1E293B", border: "#334155", text: "#F8FAFC", muted: "#94A3B8" }
    : { bg: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0", text: "#0F172A", muted: "#64748B" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, transition: "0.3s", fontFamily: "sans-serif" }}>
      <style>{`input::-webkit-inner-spin-button{display:none} .stage-btn:hover{filter:brightness(0.9)}`}</style>

      {/* Header */}
      <header style={{ padding: "20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", background: T.card }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", color: "#3B82F6" }}>المعدل التراكمي</h1>
          <p style={{ margin: 0, fontSize: "12px", color: T.muted, fontWeight: "bold" }}>
            UNIVERSITY OF WARITH AL-ANBIYAA | DEV: HAIDER EMAD
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {["grades", "details"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 15px", borderRadius: "8px", border: "none", cursor: "pointer", background: tab === t ? "#3B82F6" : T.border, color: tab === t ? "#fff" : T.text, fontWeight: "bold" }}>
              {t === "grades" ? "الدرجات" : "View in Details"}
            </button>
          ))}
          <button onClick={() => setDark(!dark)} style={{ padding: "8px", borderRadius: "8px", border: `1px solid ${T.border}`, cursor: "pointer", background: "none", color: T.text }}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* Total Display */}
      <div style={{ padding: "30px", textAlign: "center", background: "linear-gradient(135deg, #3B82F6, #2DD4BF)", color: "#fff" }}>
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "5px" }}>المعدل التراكمي الكلي (CGPA)</div>
        <div style={{ fontSize: "64px", fontWeight: "900" }}>{metrics.cumulativeGPA.toFixed(3)}%</div>
      </div>

      {tab === "grades" ? (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/* Sidebar Stages */}
          <div style={{ width: "100%", maxWidth: "250px", padding: "15px", borderRight: `1px solid ${T.border}` }}>
            {STAGES.map((s, i) => (
              <button key={i} onClick={() => setActiveStage(i)} className="stage-btn" style={{ width: "100%", padding: "15px", marginBottom: "8px", borderRadius: "10px", border: activeStage === i ? `2px solid ${s.color}` : "none", background: T.card, color: T.text, cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{s.arabic}</div>
                <div style={{ fontSize: "11px", color: T.muted }}>Weight: {s.weight}%</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: s.color, marginTop: "5px" }}>{metrics.perStage[i].avg.toFixed(2)}%</div>
              </button>
            ))}
          </div>

          {/* Main Stage Panel */}
          <div style={{ flex: 1, padding: "20px", minWidth: "320px" }}>
            <h2 style={{ color: STAGES[activeStage].color }}>{STAGES[activeStage].full}</h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {STAGES[activeStage].subjects.map((sub, i) => {
                const grade = grades[`${activeStage}-${i}`];
                const stageTotalU = STAGES[activeStage].subjects.reduce((a, s) => a + s.u, 0);
                const contrib = ((grade || 0) * sub.u / stageTotalU) * (STAGES[activeStage].weight / 100);
                
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "15px", background: T.card, padding: "12px", borderRadius: "12px", border: `1px solid ${T.border}` }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: `${STAGES[activeStage].color}22`, color: STAGES[activeStage].color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{sub.u}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{sub.en}</div>
                      <div style={{ fontSize: "12px", color: T.muted }}>{sub.ar} | Contrib: <span style={{color: STAGES[activeStage].color}}>{contrib.toFixed(4)}</span></div>
                    </div>
                    <input type="number" placeholder="0" value={grade || ""} onChange={e => setGrade(activeStage, i, e.target.value)} style={{ width: "70px", padding: "10px", borderRadius: "8px", border: `1px solid ${T.border}`, background: T.bg, color: T.text, textAlign: "center", fontWeight: "bold" }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* View in Details Tab */
        <div style={{ padding: "30px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>تفاصيل المعدل التراكمي (View in Details)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {STAGES.map((s, idx) => (
              <div key={idx} style={{ background: T.card, borderRadius: "15px", padding: "20px", border: `1px solid ${T.border}` }}>
                <h3 style={{ borderBottom: `2px solid ${s.color}`, paddingBottom: "10px" }}>{s.arabic}</h3>
                {metrics.perStage[idx].subjectCalcs.map((item, si) => (
                  <div key={si} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "5px 0", borderBottom: `1px solid ${T.border}33` }}>
                    <span>{item.en}</span>
                    <span style={{ fontWeight: "mono", color: s.color }}>{item.contrib.toFixed(5)}</span>
                  </div>
                ))}
                <div style={{ marginTop: "15px", textAlign: "right", fontWeight: "900", fontSize: "18px", color: s.color }}>
                  Stage Total: {(metrics.perStage[idx].avg * s.weight / 100).toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: T.muted, borderTop: `1px solid ${T.border}`, marginTop: "40px" }}>
        Designed and Developed for Warith Al-Anbiyaa University Students by **Haider Emad**
      </footer>
    </div>
  );
}