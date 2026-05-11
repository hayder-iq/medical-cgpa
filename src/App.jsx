import React from "react";
import jsPDF from "jspdf";

const STORAGE_KEY = "medical-cgpa-pro-v8";

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

      stage.subjects.forEach((sub) => {
        const value =
          grades[`${stage.name}-${sub.name}`];

        if (value !== "" && value !== undefined) {
          const grade = Number(value);

          if (!Number.isNaN(grade)) {
            weightedSum += grade * sub.units;
            totalUnits += sub.units;
          }
        }
      });

      const avg =
        totalUnits > 0
          ? weightedSum / totalUnits
          : 0;

      const stageGPA = toStageGPA(avg);

      return {
        ...stage,
        avg,
        stageGPA,
      };
    });

    const totalStagePoints = stageResults.reduce(
      (a, s) => a + s.stageGPA,
      0
    );

    const maxPoints = stageResults.length * 5;

    return {
      stageResults,
      totalStagePoints,
      maxPoints,
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

    let y = 40;

    metrics.stageResults.forEach((stage) => {
      doc.text(
        `${stage.name} : ${stage.stageGPA}/5`,
        20,
        y
      );

      y += 10;
    });

    y += 10;

    doc.text(
      `Total CGPA : ${metrics.totalStagePoints.toFixed(
        2
      )} / ${metrics.maxPoints}`,
      20,
      y
    );

    doc.save("cgpa.pdf");
  };

  const bg = isDark
    ? "bg-black text-white"
    : "bg-white text-black";

  return (
    <div className={`min-h-screen p-6 ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold">
            Medical CGPA Calculator
          </h1>

          <p className="opacity-70 mt-2">
            Haider Emad
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setIsDark(!isDark)}
            className="border px-4 py-2 rounded-lg"
          >
            Toggle Theme
          </button>

          <button
            onClick={downloadPDF}
            className="border px-4 py-2 rounded-lg"
          >
            Download PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {metrics.stageResults.map((stage, i) => (
              <div
                key={stage.name}
                className="border rounded-xl p-4"
              >
                <button
                  className="w-full text-left"
                  onClick={() =>
                    setOpen(open === i ? null : i)
                  }
                >
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        {stage.name}
                      </h2>

                      <p className="opacity-70">
                        GPA: {stage.stageGPA} / 5
                      </p>

                      <p className="opacity-50 text-sm">
                        Average:{" "}
                        {stage.avg.toFixed(2)}%
                      </p>
                    </div>

                    <span className="text-2xl">
                      {open === i ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {open === i && (
                  <div className="mt-4 space-y-3">
                    {stage.subjects.map((sub) => (
                      <div
                        key={sub.name}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p>{sub.name}</p>

                          <p className="text-xs opacity-50">
                            Units: {sub.units}
                          </p>
                        </div>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            grades[
                              `${stage.name}-${sub.name}`
                            ] || ""
                          }
                          onChange={(e) =>
                            update(
                              stage.name,
                              sub.name,
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-1 w-24 text-center text-black"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border rounded-xl p-6 h-fit">
            <h2 className="text-3xl font-bold">
              {metrics.totalStagePoints.toFixed(2)} /{" "}
              {metrics.maxPoints}
            </h2>

            <p className="opacity-70 mt-2">
              Total Stage GPA
            </p>

            <div className="mt-6 space-y-2">
              {metrics.stageResults.map((s) => (
                <div
                  key={s.name}
                  className="flex justify-between text-sm"
                >
                  <span>{s.name}</span>

                  <span>{s.stageGPA} / 5</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}