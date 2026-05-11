import React, { useMemo, useState } from "react";

const STAGES = [
  {
    id: 0,
    name: "1ST Stage",
    weight: 5,
    subjects: [
      { name: "Anatomy", units: 8 },
      { name: "Biology", units: 6 },
      { name: "Physics", units: 5 },
      { name: "Biochemistry", units: 4 },
      { name: "Computer Science", units: 4 },
      { name: "English", units: 1 },
      { name: "Arabic", units: 1 },
      { name: "Human Rights", units: 2 },
    ],
  },

  {
    id: 1,
    name: "2ND Stage",
    weight: 5,
    subjects: [
      { name: "Physiology", units: 10 },
      { name: "Anatomy", units: 8 },
      { name: "Biochemistry", units: 6 },
      { name: "Histology", units: 4 },
    ],
  },

  {
    id: 2,
    name: "3RD Stage",
    weight: 5,
    subjects: [
      { name: "Pathology", units: 10 },
      { name: "Pharmacology", units: 8 },
      { name: "Microbiology", units: 7 },
    ],
  },

  {
    id: 3,
    name: "4TH Stage",
    weight: 20,
    subjects: [
      { name: "Medicine", units: 10 },
      { name: "Surgery", units: 10 },
      { name: "Pediatrics", units: 5 },
    ],
  },

  {
    id: 4,
    name: "5TH Stage",
    weight: 25,
    subjects: [
      { name: "Medicine", units: 10 },
      { name: "Surgery", units: 10 },
      { name: "Gynecology", units: 5 },
    ],
  },

  {
    id: 5,
    name: "6TH Stage",
    weight: 40,
    subjects: [
      { name: "Medicine Rotation", units: 12 },
      { name: "Surgery Rotation", units: 12 },
      { name: "Pediatrics Rotation", units: 12 },
    ],
  },
];

export default function App() {
  const [grades, setGrades] = useState({});

  const setGrade = (stageId, subIndex, value) => {
    const key = `${stageId}-${subIndex}`;

    setGrades((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const metrics = useMemo(() => {
    const perStage = STAGES.map((stage) => {
      const totalUnits = stage.subjects.reduce(
        (sum, sub) => sum + sub.units,
        0
      );

      let weightedSum = 0;
      let enteredUnits = 0;

      stage.subjects.forEach((sub, i) => {
        const raw = grades[`${stage.id}-${i}`];

        const g =
          raw === "" || raw == null ? null : Number(raw);

        if (g != null && !Number.isNaN(g)) {
          weightedSum += g * sub.units;
          enteredUnits += sub.units;
        }
      });

      const stageAverage =
        enteredUnits > 0 ? weightedSum / enteredUnits : 0;

      const stageFrom5 = stageAverage / 20;

      return {
        ...stage,
        totalUnits,
        enteredUnits,
        weightedSum,
        stageAverage,
        stageFrom5,
      };
    });

    const cumulative = perStage.reduce(
      (sum, stage) => sum + stage.stageFrom5,
      0
    );

    const maxCumulative = perStage.length * 5;

    return {
      perStage,
      cumulative,
      maxCumulative,
    };
  }, [grades]);

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 35,
          marginBottom: 30,
        }}
      >
        Medical CGPA Calculator
      </h1>

      {metrics.perStage.map((stage) => (
        <div
          key={stage.id}
          style={{
            background: "#1e293b",
            padding: 20,
            borderRadius: 15,
            marginBottom: 25,
          }}
        >
          <h2>{stage.name}</h2>

          {stage.subjects.map((sub, i) => {
            const key = `${stage.id}-${i}`;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div style={{ width: 200 }}>
                  {sub.name}
                </div>

                <div
                  style={{
                    width: 70,
                    color: "#94a3b8",
                  }}
                >
                  {sub.units} Units
                </div>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grades[key] || ""}
                  onChange={(e) =>
                    setGrade(
                      stage.id,
                      i,
                      e.target.value
                    )
                  }
                  placeholder="Grade"
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: "none",
                    width: 120,
                    fontSize: 16,
                  }}
                />
              </div>
            );
          })}

          <div
            style={{
              marginTop: 20,
              background: "#334155",
              padding: 15,
              borderRadius: 12,
            }}
          >
            <p>
              <strong>Total Units:</strong>{" "}
              {stage.totalUnits}
            </p>

            <p>
              <strong>Weighted Sum:</strong>{" "}
              {stage.weightedSum.toFixed(2)}
            </p>

            <p>
              <strong>Stage Average:</strong>{" "}
              {stage.stageAverage.toFixed(2)}%
            </p>

            <p>
              <strong>From 5:</strong>{" "}
              {stage.stageFrom5.toFixed(2)} / 5
            </p>
          </div>
        </div>
      ))}

      <div
        style={{
          background: "#16a34a",
          padding: 25,
          borderRadius: 18,
          marginTop: 40,
        }}
      >
        <h1
          style={{
            fontSize: 40,
            marginBottom: 10,
          }}
        >
          CUMULATIVE
        </h1>

        <h2
          style={{
            fontSize: 32,
          }}
        >
          {metrics.cumulative.toFixed(2)} /{" "}
          {metrics.maxCumulative}
        </h2>
      </div>
    </div>
  );
}