import React from "react";
import jsPDF from "jspdf";

const STORAGE_KEY = "medical-cgpa-pro-v9";

const STAGES = [
  {
    name: "1ST Stage",
    subjects: [
      { name: "Anatomy", units: 8 },
      { name: "Biology", units: 6 },
      { name: "Medical Chemistry", units: 6 },
      { name: "Medical Physics", units: 6 },
      { name: "English", units: 4 },
      { name: "Computer Science", units: 2 },
      { name: "Medical Terminology", units: 2 },
      { name: "Basics of Medicine", units: 2 },
      { name: "Human Rights", units: 2 },
    ],
  },
  {
    name: "2ND Stage",
    subjects: [
      { name: "Physiology", units: 12 },
      { name: "Anatomy", units: 8 },
      { name: "Biochemistry", units: 9 },
      { name: "Histology", units: 6 },
      { name: "Embryology", units: 2 },
      { name: "English language", units: 2 },
      { name: "Baath Crimes", units: 2 },
    ],
  },
  {
    name: "3RD Stage",
    subjects: [
      { name: "Pathology", units: 11 },
      { name: "Microbiology", units: 9 },
      { name: "Pharmacology", units: 8 },
      { name: "Internal Medicine", units: 5 },
      { name: "Parasitology", units: 5 },
      { name: "Family & Community Medicine", units: 3 },
      { name: "Surgery", units: 2 },
    ],
  },
  {
    name: "4TH Stage",
    subjects: [
      { name: "Clinical Medicine I", units: 13 },
      { name: "Clinical Surgery I", units: 11 },
      { name: "Community Medicine II", units: 11 },
      { name: "Obstetrics", units: 6 },
      { name: "Forensic Medicine", units: 6 },
      { name: "Pediatrics", units: 2 },
      { name: "Medical Ethics", units: 2 },
      { name: "Psychology", units: 2 },
    ],
  },
  {
    name: "5TH Stage",
    subjects: [
      { name: "Medicine III", units: 7 },
      { name: "Surgery Minor II", units: 6 },
      { name: "Pediatrics", units: 5.5 },
      { name: "Gynecology", units: 5.5 },
      { name: "Psychiatry", units: 4.5 },
      { name: "Orthopaedics", units: 4.5 },
      { name: "Dermatology", units: 3.5 },
      { name: "Radiology", units: 3 },
      { name: "Ophthalmology", units: 3 },
      { name: "ENT", units: 3.5 },
    ],
  },
  {
    name: "6TH Stage",
    subjects: [
      { name: "Internal Medicine Rotation", units: 12 },
      { name: "Surgery Rotation", units: 12 },
      { name: "Pediatrics Rotation", units: 12 },
      { name: "OBGYN Rotation", units: 4 },
    ],
  },
];

function clamp(v) {
  if (v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return "";
  return String(Math.max(0, Math.min(100, n)));
}

function toStageGPA(avg) {
  if (avg >= 90) return 5;
  if (avg >= 80) return 4;
  if (avg >= 70) return 3;
  if (avg >= 60) return 2;
  if (avg >= 50) return 1;
  return 0;
}

export default function App() {
  const [grades, setGrades] = React.useState({});
  const [open, setOpen] = React.useState(null);
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setGrades(parsed.grades || {});
      setIsDark(parsed.isDark ?? true);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ grades, isDark })
    );
  }, [grades, isDark]);

  const metrics = React.useMemo(() => {
    const stageResults = STAGES.map((stage) => {
      let weightedSum = 0;
      let totalUnits = 0;
      let enteredSubjects = 0;

      stage.subjects.forEach((sub) => {
        const value = grades[`${stage.name}-${sub.name}`];

        if (value !== "" && value !== undefined) {
          const grade = Number(value);
          if (!Number.isNaN(grade)) {
            weightedSum += grade * sub.units;
            totalUnits += sub.units;
            enteredSubjects += 1;
          }
        }
      });

      const avg = totalUnits > 0 ? weightedSum / totalUnits : 0;
      const stageGPA = toStageGPA(avg);

      return {
        ...stage,
        avg,
        stageGPA,
        hasGrades: enteredSubjects > 0,
      };
    });

    const enteredStages = stageResults.filter((s) => s.hasGrades);
    const earnedWeight = enteredStages.reduce(
      (sum, s) => sum + s.stageGPA,
      0
    );
    const maxWeight = enteredStages.length * 5;

    const allSubjects = STAGES.reduce(
      (sum, s) => sum + s.subjects.length,
      0
    );

    const enteredSubjectsCount = Object.values(grades).filter(
      (v) => v !== ""
    ).length;

    return {
      stageResults,
      enteredStages,
      earnedWeight,
      maxWeight,
      progress:
        allSubjects > 0
          ? (enteredSubjectsCount / allSubjects) * 100
          : 0,
      enteredSubjectsCount,
      allSubjects,
    };
  }, [grades]);

  const update = (stage, subject, value) => {
    setGrades((prev) => ({
      ...prev,
      [`${stage}-${subject}`]: clamp(value),
    }));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Medical CGPA Transcript", 20, 20);
    doc.text("Name: Haider Emad", 20, 30);
    doc.text("University: Warith Al-Anbiyaa", 20, 40);
    doc.text(
      `Earned Weight: ${metrics.earnedWeight.toFixed(2)} / ${metrics.maxWeight}`,
      20,
      50
    );

    let y = 70;

    metrics.stageResults.forEach((stage) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        `${stage.name} : ${stage.stageGPA.toFixed(2)} / 5`,
        20,
        y
      );
      y += 10;
    });

    doc.save("cgpa.pdf");
  };

  const bg = isDark
    ? "bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white"
    : "bg-gradient-to-b from-slate-50 to-slate-200 text-black";

  return (
    <div className={`min-h-screen transition-all duration-300 ${bg}`}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-4xl font-black">Medical CGPA</h1>
          <p className="opacity-70">Haider Emad</p>
          <p className="text-sm opacity-50">University of Warith Al-Anbiyaa</p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setIsDark(!isDark)}
            className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 backdrop-blur"
          >
            Download PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {metrics.stageResults.map((stage, i) => (
              <div
                key={stage.name}
                className="rounded-3xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-xl"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <div>
                    <h2 className="text-xl font-bold">{stage.name}</h2>
                    <p className="text-sm opacity-70">
                      GPA: {stage.stageGPA.toFixed(2)} / 5
                    </p>
                    <p className="text-sm opacity-50">
                      Average: {stage.avg.toFixed(2)}%
                    </p>
                  </div>
                  <span className="text-2xl">{open === i ? "−" : "+"}</span>
                </button>

                {open === i && (
                  <div className="p-5 pt-0 space-y-3">
                    {stage.subjects.map((sub) => (
                      <div
                        key={sub.name}
                        className="flex justify-between items-center gap-3"
                      >
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-xs opacity-50">Units: {sub.units}</p>
                        </div>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grades[`${stage.name}-${sub.name}`] || ""}
                          onChange={(e) =>
                            update(stage.name, sub.name, e.target.value)
                          }
                          className="w-24 rounded-xl px-3 py-2 text-center text-black"
                          placeholder="0-100"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-3xl font-black">
                {metrics.earnedWeight.toFixed(2)} / {metrics.maxWeight}
              </h2>
              <p className="opacity-70 mt-2">EARNED WEIGHT</p>

              <div className="mt-6 space-y-2">
                {metrics.enteredStages.length === 0 ? (
                  <p className="text-sm opacity-60">No stage entered yet.</p>
                ) : (
                  metrics.stageResults
                    .filter((s) => s.hasGrades)
                    .map((s) => (
                      <div
                        key={s.name}
                        className="flex justify-between text-sm"
                      >
                        <span>{s.name}</span>
                        <span>{s.stageGPA.toFixed(2)} / 5</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex justify-between text-sm opacity-70">
                <span>Filled subjects</span>
                <span>
                  {metrics.enteredSubjectsCount} / {metrics.allSubjects}
                </span>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${metrics.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}