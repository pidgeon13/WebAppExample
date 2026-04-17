// ---------------------------------------------------------------
// Home Page  –  src/app/page.tsx
// ---------------------------------------------------------------
// This is the ONLY page in our app.  It renders:
//   1. A <textarea> for the user to type a note.
//   2. A Submit button that POSTs the note to /api/notes.
//   3. The JSON response displayed on screen.
//
// "use client" tells Next.js this component runs in the browser
// (we need browser APIs like useState and fetch).
// ---------------------------------------------------------------
"use client";

import { useState, FormEvent } from "react";

// ----- Shape of a successful API response -----
interface NoteResult {
  ok: boolean;
  note?: string;
  savedAt?: string;
  error?: string;
  status: number; // HTTP status code (e.g. 200, 400, 422)
}

export default function HomePage() {
  // --- State variables ---
  // `note`      – the text the user types
  // `result`    – the JSON we get back from the API
  // `loading`   – true while the fetch is in progress
  const [note, setNote] = useState("");
  const [result, setResult] = useState<NoteResult | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Form submit handler ---
  // `async` because we use `await fetch(…)`
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent the browser from doing a full page reload.
    event.preventDefault();

    // Clear any previous result and show a loading state.
    setResult(null);
    setLoading(true);

    try {
      // Send a POST request to our API route.
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }), // send the note as JSON
        //body: "{note : hi}", // Invalid JSON to test error handling in the API route (uncomment to test)
      });

      // Parse the JSON the API sends back.
      const data = await response.json();

      // Attach the HTTP status so the UI can branch on it.
      setResult({ ...data, status: response.status });
    } catch {
      // Network error or something unexpected.
      setResult({ ok: false, error: "Failed to reach the server.", status: 0 });
    } finally {
      // Whether success or failure, stop the loading spinner.
      setLoading(false);
    }
  }

  // --- Render the UI ---
  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>📝 Note Saver</h1>
      <p>Type a note (max 500 characters) and hit <strong>Submit</strong>.</p>

      {/* ---- The form ---- */}
      <form onSubmit={handleSubmit}>
        {/* Textarea for the note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here…"
          rows={5}
          style={{ width: "100%", fontSize: "1rem", padding: "0.5rem" }}
        />

        {/* Character counter – helps the user stay under 500 */}
        <p style={{ fontSize: "0.85rem", color: note.length > 500 ? "red" : "#555" }}>
          {note.length} / 500 characters
        </p>

        {/* Submit button – disabled while loading */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 1.5rem",
            fontSize: "1rem",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Submitting…" : "Submit"}
        </button>
      </form>

      {/* ---- Display the API response ---- */}
      {result && (
        <section
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: 8,
            backgroundColor: result.ok ? "#f0fdf4" : "#fef2f2",
          }}
        >
          <h2>{result.ok ? "✅ Saved!" : "❌ Error"}</h2>
          {result.status === 422 && (
            <p style={{ color: "red" }}>Validation error: {result.error}</p>
          )}
          {result.status === 400 && (
            <p style={{ color: "red" }}>Bad request: {result.error}</p>
          )}

          {/* Pretty-print the full JSON response only on success */}
          {result.ok && (
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </section>
      )}
    </main>
  );
}
