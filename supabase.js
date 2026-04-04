import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cvkoknutkdkgldcswioy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a29rbnV0a2RrZ2xkY3N3aW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzgzMzYsImV4cCI6MjA5MDkxNDMzNn0.xm6zfkASEIQrsqx-u2ndrJPfZ8bzXeaL4-KBooToV20';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);