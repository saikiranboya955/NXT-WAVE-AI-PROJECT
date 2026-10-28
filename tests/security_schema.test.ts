import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Security & Database Schema Audit', () => {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const migrationPath = path.join(
    rootDir,
    'supabase',
    'migrations',
    '20261028000001_create_aipp_schema.sql'
  );
  const edgeFunctionPath = path.join(
    rootDir,
    'supabase',
    'functions',
    'register',
    'index.ts'
  );

  it('verifies SQL migration file exists and is non-empty', () => {
    assert.ok(fs.existsSync(migrationPath), 'Migration SQL file must exist');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(sql.length > 500, 'Migration SQL must contain complete schema');
  });

  it('verifies Row-Level Security (RLS) is enabled on all core tables', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const expectedTables = [
      'registrations',
      'referral_codes',
      'campaign_events',
      'campaign_expenses',
      'admin_profiles',
    ];

    for (const table of expectedTables) {
      assert.ok(
        sql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`),
        `RLS must be enabled on table ${table}`
      );
    }
  });

  it('verifies atomic RPC registration function uses SECURITY DEFINER', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(
      sql.includes('CREATE OR REPLACE FUNCTION public.register_student'),
      'register_student function must be defined'
    );
    assert.ok(
      sql.includes('SECURITY DEFINER'),
      'register_student must run with SECURITY DEFINER to safely insert without public table access'
    );
    assert.ok(
      sql.includes('search_path = public'),
      'register_student must set immutable search_path against search_path hijack vulnerabilities'
    );
  });

  it('verifies Edge Function exists and validates inputs server-side', () => {
    assert.ok(fs.existsSync(edgeFunctionPath), 'Edge function index.ts must exist');
    const fnCode = fs.readFileSync(edgeFunctionPath, 'utf8');
    assert.ok(fnCode.includes('test(email)'), 'Must validate email server-side');
    assert.ok(fnCode.includes('name.length') || fnCode.includes('name.trim()'), 'Must validate student name');
    assert.ok(fnCode.includes('validYears') || fnCode.includes('2025'), 'Must enforce graduation years');
    assert.ok(fnCode.includes('Access-Control-Allow-Origin'), 'Must include CORS headers');
  });

  it('verifies .env.example contains placeholders only and no real secrets', () => {
    const envExamplePath = path.join(rootDir, '.env.example');
    assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');
    const content = fs.readFileSync(envExamplePath, 'utf8');

    assert.ok(content.includes('VITE_SUPABASE_URL='), 'Must document VITE_SUPABASE_URL');
    assert.ok(content.includes('VITE_SUPABASE_ANON_KEY='), 'Must document VITE_SUPABASE_ANON_KEY');

    // Never contain actual production secrets
    assert.ok(!content.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey'), 'Must not contain real JWT');
    assert.ok(!content.includes('service_role'), 'Must not expose service-role key in client example');
  });

  it('verifies .gitignore properly excludes .env files', () => {
    const gitignorePath = path.join(rootDir, '.gitignore');
    assert.ok(fs.existsSync(gitignorePath), '.gitignore must exist');
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    assert.ok(gitignore.includes('.env'), '.gitignore must exclude .env');
  });
});
