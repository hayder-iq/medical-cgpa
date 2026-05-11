import React from "react";
import jsPDF from "jspdf";

const STORAGE_KEY = "medical-cgpa-pro-v10";

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
  const [open, setOpen] = React.useState(0);
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data = JSON.parse(saved);

      setGrades(data.grades || {});
      setIsDark(data.isDark ?? true);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ grades, isDark })
    );
  }, [grades, isDark]);

  React.useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      isDark
    );
  }, [isDark]);

  const metrics = React.useMemo(() => {
    const stageResults = STAGES.map((stage) => {
      let weightedSum = 0;
      let totalUnits = 0;
      let hasGrades = false;

      stage.subjects.forEach((sub) => {
        const value =
          grades[`${stage.name}-${sub.name}`];

        if (value !== "" && value !== undefined) {
          const grade = Number(value);

          if (!Number.isNaN(grade)) {
            weightedSum += grade * sub.units;
            totalUnits += sub.units;
            hasGrades = true;
          }
        }
      });

      const avg =
        totalUnits > 0
          ? weightedSum / totalUnits
          : 0;

      return {
        ...stage,
        avg,
        stageGPA: toStageGPA(avg),
        hasGrades,
      };
    });

    const enteredStages = stageResults.filter(
      (s) => s.hasGrades
    );

    const earnedWeight = enteredStages.reduce(
      (sum, s) => sum + s.stageGPA,
      0
    );

    const maxWeight =
      enteredStages.length * 5;

    return {
      stageResults,
      earnedWeight,
      maxWeight,
    };
  }, [grades]);

  const update = (stage, sub, value) => {
    setGrades((prev) => ({
      ...prev,
      [`${stage}-${sub}`]: clamp(value),
    }));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Medical Transcript", 20, 20);

    doc.text(
      `Earned Weight: ${metrics.earnedWeight.toFixed(
        2
      )} / ${metrics.maxWeight}`,
      20,
      35
    );

    let y = 50;

    metrics.stageResults.forEach((stage) => {
      doc.text(
        `${stage.name} : ${stage.stageGPA}/5`,
        20,
        y
      );

      y += 10;
    });

    doc.save("transcript.pdf");
  };

  const bg = isDark
    ? "bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white"
    : "bg-gradient-to-b from-slate-50 to-slate-200 text-black";

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${bg}`}
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black">
            Medical CGPA
          </h1>

          <p className="opacity-70">
            Haider Emad
          </p>

          <p className="text-sm opacity-50">
            University of Warith Al-Anbiyaa
          </p>
        </div>

        <div className="flex justify-center gap-3 my-6">
          <button
            onClick={() =>
              setIsDark(!isDark)
            }
            className="px-4 py-2 rounded-xl bg-zinc-800 text-white"
          >
            {isDark
              ? "Light Mode"
              : "Dark Mode"}
          </button>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
          >
            Download Transcript
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {metrics.stageResults.map(
              (stage, i) => (
                <div
                  key={stage.name}
                  className="rounded-3xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-xl"
                >
                  <button
                    onClick={() =>
                      setOpen(
                        open === i
                          ? null
                          : i
                      )
                    }
                    className="w-full flex justify-between p-5"
                  >
                    <div className="text-left">
                      <h2 className="text-xl font-bold">
                        {stage.name}
                      </h2>

                      <p className="text-sm opacity-70">
                        GPA:{" "}
                        {stage.stageGPA.toFixed(
                          2
                        )}{" "}
                        / 5
                      </p>

                      <p className="text-sm opacity-50">
                        Average:{" "}
                        {stage.avg.toFixed(
                          2
                        )}
                        %
                      </p>
                    </div>

                    <span className="text-2xl">
                      {open === i
                        ? "−"
                        : "+"}
                    </span>
                  </button>

                  {open === i && (
                    <div className="p-5 space-y-3">
                      {stage.subjects.map(
                        (sub) => (
                          <div
                            key={sub.name}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <span>
                                {sub.name}
                              </span>

                              <p className="text-xs opacity-50">
                                Units:{" "}
                                {sub.units}
                              </p>
                            </div>

                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="bg-black/30 px-3 py-1 rounded-xl w-24 text-center"
                              value={
                                grades[
                                  `${stage.name}-${sub.name}`
                                ] || ""
                              }
                              onChange={(
                                e
                              ) =>
                                update(
                                  stage.name,
                                  sub.name,
                                  e.target
                                    .value
                                )
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-center">
              <h2 className="text-5xl font-black">
                {metrics.earnedWeight.toFixed(
                  2
                )}{" "}
                /{" "}
                {metrics.maxWeight}
              </h2>

              <p className="font-bold mt-2">
                EARNED WEIGHT
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3">
              {metrics.stageResults
                .filter(
                  (s) => s.hasGrades
                )
                .map((s) => (
                  <div
                    key={s.name}
                    className="flex justify-between"
                  >
                    <span>
                      {s.name}
                    </span>

                    <span>
                      {s.stageGPA.toFixed(
                        2
                      )}{" "}
                      / 5
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}