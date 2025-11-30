import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Judge0 language IDs (verified from https://ce.judge0.com/languages)
const languageIds: Record<string, number> = {
  javascript: 63, // Node.js 12.14.0
  typescript: 74, // TypeScript 3.7.4
  python: 71, // Python 3.8.1
  c: 50, // C (GCC 9.2.0)
  cpp: 54, // C++ (GCC 9.2.0)
  csharp: 51, // C# (Mono 6.6.0.161)
  java: 62, // Java (OpenJDK 13.0.1)
  kotlin: 78, // Kotlin 1.3.70
  swift: 83, // Swift 5.2.3
  php: 68, // PHP 7.4.1
  ruby: 72, // Ruby 2.7.0
  go: 60, // Go 1.13.5
  rust: 73, // Rust 1.40.0
  r: 80, // R 4.0.0
  perl: 85, // Perl 5.28.1
  bash: 46, // Bash 5.0.0
  sql: 82, // SQL (SQLite 3.27.2)
  scala: 81, // Scala 2.13.2
  haskell: 61, // Haskell (GHC 8.8.1)
  lua: 64, // Lua 5.3.5
  elixir: 57, // Elixir 1.9.4
  clojure: 86, // Clojure 1.10.1
  fsharp: 87, // F# (.NET Core SDK 3.1.202)
  dart: 90, // Dart 2.19.2
  fortran: 59, // Fortran (GFortran 9.2.0)
  cobol: 77, // COBOL (GnuCOBOL 2.2)
  pascal: 67, // Pascal (FPC 3.0.4)
  assembly: 45, // Assembly (NASM 2.14.02)
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
    console.log(`Submitting ${language} code with language_id: ${languageId}`);

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
      console.error("Status:", submitResponse.status, submitResponse.statusText);
      return new Response(
        JSON.stringify({
          error: `Failed to submit code for execution. Judge0 API returned ${submitResponse.status}: ${submitResponse.statusText}`,
          details: errorText
        }),
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
      // Filter out noisy JVM warnings
      error = result.stderr
        .replace(/OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release\.\n?/g, "")
        .trim();

      if (!error) error = null; // If error becomes empty after filtering, set to null
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
