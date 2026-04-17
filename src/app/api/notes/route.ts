// ---------------------------------------------------------------
// API Route: POST /api/notes
// ---------------------------------------------------------------
// This file handles incoming POST requests.  It validates the
// submitted note and returns a JSON response.
//
// Next.js "Route Handlers" live in the app directory and export
// functions named after HTTP methods (GET, POST, etc.).
// ---------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

// ----- Profanity filter -----
// leo-profanity ships a built-in word list and checks for common
// variations.  No configuration needed – just import and use.
import leoProfanity from "leo-profanity";

// ----- Type for the successful response -----
interface NoteResponse {
  ok: true;
  note: string;
  savedAt: string; // ISO-8601 timestamp
}

// ----- Type for error responses -----
interface ErrorResponse {
  ok: false;
  error: string;
}

/**
 * POST /api/notes
 *
 * Expects a JSON body like: { "note": "some text" }
 * Returns JSON with the saved note and a timestamp.
 */
export async function POST(request: NextRequest) {
  // --- 1. Parse the request body as JSON ---
  // We wrap this in try/catch because the body might not be valid JSON.
  let body: { note?: unknown };

  try {
    body = await request.json();
  } catch {
    // If the body can't be parsed, tell the client.
    const errorResponse: ErrorResponse = {
      ok: false,
      error: "Invalid JSON in request body.",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }
  //await new Promise(r => setTimeout(r, 2000)); // Simulate a slow network or heavy processing (for testing loading states)
  // --- 2. Pull out the "note" field ---
  const note = body.note;

  // --- 3. Validate: note must be a non-empty string ---
  if (typeof note !== "string" || note.trim().length === 0) {
    const errorResponse: ErrorResponse = {
      ok: false,
      error: "Note must be a non-empty string.",
    };
    return NextResponse.json(errorResponse, { status: 422 });
  }

  // --- 4. Validate: note must be under 500 characters ---
  if (note.length > 500) {
    const errorResponse: ErrorResponse = {
      ok: false,
      error: "Note must be under 500 characters.",
    };
    return NextResponse.json(errorResponse, { status: 422 });
  }
  if(note.length < 5) {
    const errorResponse: ErrorResponse = {
      ok: false,
      error: "Note must be at least 5 characters.",
    };
    return NextResponse.json(errorResponse, { status: 422 });
  }
  // --- Check for profanity using leo-profanity's built-in word list ---
  if (leoProfanity.check(note)) {
    return NextResponse.json({ ok: false, error: "Your note contains a naughty word." }, { status: 422 });
  }
  if(note.toLowerCase().includes("egg")) {
    const successResponse: NoteResponse = {
      ok: true,
      note: "Well done for finding my egg",
    savedAt: new Date().toISOString(), // current UTC time
    };
    return NextResponse.json(successResponse, { status: 201 });
  }


  // --- 5. Build the success response ---
  // In a real app you'd save to a database here.  We just echo it back
  // with a timestamp so the client can confirm the round-trip.
  const successResponse: NoteResponse = {
    ok: true,
    note: note.trim(),           // trim whitespace for cleanliness
    savedAt: new Date().toISOString(), // current UTC time
  };

  // --- 6. Return 201 Created with the JSON payload ---
  return NextResponse.json(successResponse, { status: 201 });
}
