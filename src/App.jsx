import { useState, useMemo, useEffect, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ─── DATA ───────────────────────────────────────────────
const STAGES = [
  {
    id: 0,
    label: "1st",
    full: "First Stage",
    weight: 5,
    subjects: [
      { en: "Anatomy", u: 8 },
      { en: "Biology", u: 6 },
      { en: "Chemistry", u: 6 }
    ]
  },
  {
    id: 1,
    label: "2nd",
    full: "Second Stage",
    weight: 5,
    subjects: [
      { en: "Physiology", u: 10 },
      { en: "Anatomy", u: 8 }
    ]
  },
  {
    id: 2,
    label: "3rd",
    full: "Third Stage",
    weight: 5,
    subjects: [
      { en: "Pathology", u: 10 },
      { en: "Pharmacology", u: 8 }
    ]
  },
  {
    id: 3,
    label: "4th",
    full: "Fourth Stage",
    weight: 20,
    subjects: [
      { en: "Medicine", u: 10 },
      { en: "Surgery", u: 10 }
    ]
  }
];

// ─── CLASSIFY ───────────────────────────────────────────
const classify = (g) => {
  if (g >= 90) return { label: "Excellent", color: "#10B981" };
  if (g >= 80) return { label: "Very Good", color: "#60A5FA" };
  if (g >= 70) return { label: "Good", color: "#A78BFA" };
  if (g >= 60) return { label: "Medium", color: "#FBBF24" };
  if (g >= 50) return { label: "Pass", color: "#F97316" };
  return { label: "Fail", color: "#EF4444" };
};

// ─── APP ────────────────────────────────────────────────
export default function App() {
  const [grades, setGrades] = useState({});
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState(0);

  // ─── STORAGE SAFE ─────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("cgpa_full");
    if (saved) {
      const d = JSON.parse(saved);
      setGrades(d.grades || {});
      setDark(d.dark || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cgpa_full", JSON.stringify({ grades, dark }));
  }, [grades, dark]);

  const setGrade = useCallback((sid, i, v) => {
    const key = `${sid}-${i}`;
    setGrades(prev => {
      const copy = { ...prev };
      if (v === "") delete copy[key];
      else copy[key] = Number(v);
      return copy;
    });
  }, []);

  // ─── FIXED CGPA LOGIC ─────────────────────────────────
  const metrics = useMemo(() => {
    let weightedSum = 0;
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
        weightedSum += avg * stage.weight;
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

    const cgpa = weightedSum / 100;

    return {
      cgpa,
      completedWeight,
      perStage,
      cls: classify(cgpa)
    };
  }, [grades]);

  // ─── THEME ────────────────────────────────────────────
  const T = {
    bg: dark ? "#0B0F19" : "#F6F7FB",
    card: dark ? "#121A2A" : "#FFFFFF",
    text: dark ? "#FFFFFF" : "#111827"
  };

  // ─── UI ───────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      padding: 12,
      fontFamily: "system-ui"
    }}>

      {/* HEADER (MOBILE SAFE) */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginBottom: 12
      }}>
        <div style={{ fontWeight: 900, fontSize: 20 }}>
          HAIDER EMAD
        </div>

        <button onClick={() => setDark(!dark)}>
          Toggle Theme
        </button>
      </div>

      {/* CGPA CARD */}
      <div style={{
        background: T.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12
      }}>
        <div>CGPA</div>
        <div style={{ fontSize: 36, fontWeight: 900 }}>
          {metrics.cgpa.toFixed(2)}
        </div>
        <div style={{ color: metrics.cls.color }}>
          {metrics.cls.label}
        </div>

        <div style={{ marginTop: 8 }}>
          Completed Weight: {metrics.completedWeight} / 100
        </div>
      </div>

      {/* STAGES (FULL RESPONSIVE FIX) */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        {STAGES.map((stage, si) => (
          <div key={stage.id} style={{
            background: T.card,
            padding: 12,
            borderRadius: 12
          }}>

            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              {stage.full} ({stage.weight}%)
            </div>

            {/* SUBJECTS */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>
              {stage.subjects.map((s, i) => {
                const key = `${stage.id}-${i}`;
                const g = grades[key];

                return (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: 13 }}>
                      {s.en}
                    </span>

                    <input
                      type="number"
                      value={g ?? ""}
                      onChange={(e) => setGrade(stage.id, i, e.target.value)}
                      style={{
                        width: 70,
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        textAlign: "center"
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* STAGE STATUS */}
            <div style={{ marginTop: 10 }}>
              {metrics.perStage[si].complete ? (
                <b style={{ color: "#10B981" }}>
                  Completed ✔
                </b>
              ) : (
                <span style={{ opacity: 0.5 }}>
                  In progress
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{
        marginTop: 20,
        textAlign: "center",
        fontSize: 12,
        opacity: 0.6
      }}>
        Fully Mobile Optimized + Fixed CGPA System
      </div>
    </div>
  );
}