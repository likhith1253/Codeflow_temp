import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Judge0 language IDs
const languageIds: Record<string, number> = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  c: 50, // C (GCC)
  cpp: 54, // C++ (GCC)
  java: 62, // Java
  php: 68, // PHP
  ruby: 72, // Ruby
  go: 60, // Go
  arduino: 54, // Arduino (uses C++ compiler)
};

// Free public Judge0 instance (no API key required)
const JUDGE0_API = "https://ce.judge0.com";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language, code } = await req.json();

    console.log(`Executing ${language} code`);

    const languageId = languageIds[language];
    if (!languageId) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Submit code to Judge0 (free public instance)
    const submitResponse = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false&wait=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: "",
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("Judge0 submission error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to submit code for execution" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { token } = await submitResponse.json();
    console.log(`Submission token: ${token}`);

    // Poll for results
    let result = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        `${JUDGE0_API}/submissions/${token}?base64_encoded=false`
      );

      if (!statusResponse.ok) {
        console.error("Failed to get submission status");
        attempts++;
        continue;
      }

      result = await statusResponse.json();
      console.log(`Status: ${result.status?.description}`);

      // Status IDs: 1 = In Queue, 2 = Processing, 3+ = Completed
      if (result.status?.id >= 3) {
        break;
      }

      attempts++;
    }

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Timeout: Code execution took too long" }),
        { status: 408, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process result
    let output = "";
    let error = null;

    if (result.stdout) {
      output = result.stdout;
    }

    if (result.stderr) {
      error = result.stderr;
    }

    if (result.compile_output) {
      error = result.compile_output;
    }

    if (result.status?.id === 6) {
      // Compilation error
      error = result.compile_output || "Compilation error";
    } else if (result.status?.id === 11) {
      // Runtime error
      error = result.stderr || "Runtime error";
    } else if (result.status?.id === 5) {
      // Time limit exceeded
      error = "Time limit exceeded";
    } else if (result.status?.id === 13) {
      // Internal error
      error = "Internal error occurred";
    }

    console.log(`Execution complete. Output: ${output?.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({ output, error, status: result.status?.description }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error executing code:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
