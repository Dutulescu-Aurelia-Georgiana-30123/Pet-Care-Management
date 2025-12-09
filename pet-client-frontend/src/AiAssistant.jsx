// src/AiAssistant.jsx
import React, { useState } from "react";

function AiAssistant() {
  const [symptoms, setSymptoms] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      setError("Te rog descrie simptomele animalului.");
      return;
    }

    setError("");
    setAnswer("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/ai/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error("Eroare server: " + text);
      }

      const data = await response.json();
      setAnswer(data.answer || "Nu am primit un răspuns de la AI.");
    } catch (err) {
      console.error(err);
      setError("A apărut o eroare la apelul către AI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-card">
      <h2>Asistent veterinar (AI)</h2>
      <p className="ai-description">
        Scrie simptomele animalului tău, iar asistentul AI îți oferă o explicație
        posibilă și recomandări generale. Nu înlocuiește un consult veterinar!
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Ex: Câinele meu nu mănâncă, este foarte obosit și a vomat de două ori în ultimele 24 de ore."
          rows={5}
          style={{ width: "100%", resize: "vertical", padding: "8px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}
        >
          {loading ? "Analizez simptomele..." : "Trimite la AI"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "10px", color: "red" }}>
          {error}
        </div>
      )}

      {answer && !error && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: "#f4f4f4",
            whiteSpace: "pre-wrap",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

export default AiAssistant;
