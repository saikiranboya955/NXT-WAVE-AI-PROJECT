// ==============================================================================
// NXTWAVE AI PROJECT PASSPORT: SUPABASE EDGE FUNCTION (Registration Endpoint)
// Path: supabase/functions/register/index.ts
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RegisterPayload {
  name: string;
  email: string;
  college: string;
  graduationYear: string;
  projectId?: string;
  referralCode?: string;
  source?: string;
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration missing." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: RegisterPayload = await req.json();

    // 2. Server-side validation
    const name = payload.name?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const college = payload.college?.trim() ?? "";
    const graduationYear = payload.graduationYear?.trim() ?? "";
    const projectId = payload.projectId ?? "resume-feedback";
    const referralCode = payload.referralCode?.trim() || null;
    const source = payload.source ?? "direct";

    if (name.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Name must be at least 2 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Please provide a valid email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (college.length < 3) {
      return new Response(
        JSON.stringify({ success: false, error: "College name must be at least 3 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validYears = ["2025", "2026", "2027", "2028"];
    if (!validYears.includes(graduationYear)) {
      return new Response(
        JSON.stringify({ success: false, error: "Workshop is for final-year students (2025-2028)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Initialize Supabase Admin Client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Call Atomic Database Procedure
    const { data, error } = await supabase.rpc("register_student", {
      p_name: name,
      p_email: email,
      p_college: college,
      p_grad_year: graduationYear,
      p_project_id: projectId,
      p_ref_code: referralCode,
      p_source: source,
    });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusCode = data?.already_registered ? 200 : 201;

    return new Response(
      JSON.stringify(data),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
