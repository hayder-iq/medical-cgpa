import { useState, useMemo, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ─── CURRICULUM ─────────────────────────────────────────────
const STAGES = [
  {
    id: 0, label: "1st", full: "First Stage", arabic: "المرحلة الأولى",
    color: "#60A5FA", weight: 5,
    subjects: [
      { en: "Anatomy", u: 8 },
      { en: "Biology", u: 6 },
      { en: "Chemistry", u: 6 },
    ],
  },
  {
    id: 1, label: "2nd", full: "Second Stage", arabic: "الثانية",
    color: "#A78BFA", weight: 5,
    subjects: [
      { en: "Physiology", u: 10 },
      { en: "Anatomy", u: 8 },
    ],
  },
  {
    id: 2, label: "3rd", full: "Third Stage", arabic: "الثالثة",
    color: "#F87171", weight: 5,
    subjects: [
      { en: "Pathology", u: 10 },
      { en: "Pharmacology", u: 8 },
    ],
  },
  {
    id: 3, label: "4th", full: "Fourth Stage", arabic: "الرابعة",
    color: "#FBBF24", weight: 20,
    subjects: [
      { en: "Medicine", u: 10 },
      { en: "Surgery", u: 10 },
    ],
  },
];

const classify = (g) => {
  if (g >= 90) return { label: "Excellent", color: "#10B981" };
  if (g >= 80) return { label: "Very Good", color: "#60A5FA" };
  if (g >= 70) return { label: "Good", color: "#A78BFA" };
  if (g >= 60) return { label: "Medium", color: "#FBBF24" };
  if (g >= 50) return { label: "Pass", color: "#F97316" };
  return { label: "Fail", color: "#EF4444" };
};

// ─── APP ─────────────────────────────────────────────────────
export default function App() {
  const [grades, setGrades] = useState({});
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("cgpa");
    if (saved) {
      const d = JSON.parse(saved);
      setGrades(d.grades || {});
      setDark(d.dark || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cgpa", JSON.stringify({ grades, dark }));
  }, [grades, dark]);

  const setGrade = useCallback((sid, i, v) => {
    const key = `${sid}-${i}`;
    setGrades(p => {
      const c = { ...p };
      if (v === "") delete c[key];
      else c[key] = Number(v);
      return c;
    });
  }, []);

  // ─── CORE FIXED LOGIC ───────────────────────────────
  const metrics = useMemo(() => {
    let weighted = 0;
    let completedWeight = 0;

    const perStage = STAGES.map(stage => {
      let sum = 0;
      let count = 0;
      const totalU = stage.subjects.reduce((a, s) => a + s.u, 0);

      stage.subjects.forEach((s, i) => {
        const g = grades[`${stage.id}-${i}`];
        if (g != null) {
          sum += g;
          count++;
        }
      });

      const avg = count ? sum / count : null;
      const complete = count === stage.subjects.length;

      let earned = 0;

      if (complete && avg != null) {
        weighted += avg * stage.weight;
        completedWeight += stage.weight;
        earned = stage.weight;
      }

      return {
        avg,
        complete,
        earned,
        weight: stage.weight
      };
    });

    const cgpa = weighted / 100;

    return {
      cgpa,
      completedWeight,
      perStage,
      cls: classify(cgpa)
    };
  }, [grades]);

  const T = {
    bg: dark ? "#0B0F19" : "#F5F7FB",
    card: dark ? "#121A2A" : "#fff",
    text: dark ? "#fff" : "#111"
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: 10, color: T.text }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 900, fontSize: 20 }}>
          HAIDER EMAD
        </div>
        <button onClick={() => setDark(!dark)}>
          Toggle
        </button>
      </div>

      {/* CGPA */}
      <div style={{ background: T.card, padding: 20, borderRadius: 12 }}>
        <div>CGPA</div>
        <div style={{ fontSize: 40, fontWeight: 900 }}>
          {metrics.cgpa.toFixed(2)}
        </div>
        <div style={{ color: metrics.cls.color }}>
          {metrics.cls.label}
        </div>

        <div style={{ marginTop: 10 }}>
          Completed Weight: {metrics.completedWeight} / 100
        </div>
      </div>

      {/* STAGES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 10,
        marginTop: 20
      }}>
        {STAGES.map((s, si) => (
          <div key={s.id} style={{ background: T.card, padding: 10, borderRadius: 10 }}>
            <h3>{s.full}</h3>

            <div style={{ marginBottom: 10 }}>
              Weight: {s.weight}
            </div>

            <div>
              {s.subjects.map((sub, i) => {
                const key = `${s.id}-${i}`;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{sub.en}</span>
                    <input
                      style={{ width: 60 }}
                      value={grades[key] ?? ""}
                      onChange={(e) => setGrade(s.id, i, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            {/* STAGE RESULT */}
            <div style={{ marginTop: 10 }}>
              {metrics.perStage[si].complete ? (
                <b style={{ color: "#10B981" }}>
                  +{metrics.perStage[si].earned}
                </b>
              ) : (
                <span style={{ opacity: 0.5 }}>Not complete</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}