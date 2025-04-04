'use server';

import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

// Create a Supabase client for server actions
export const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // In a server action, we can't set cookies directly
          // This is handled differently in middleware.ts where we have access to the response
        },
        remove() {
          // In a server action, we can't remove cookies directly
          // This is handled differently in middleware.ts where we have access to the response
        },
      },
    }
  );
};

// Get current session
export async function getSession() {
  const supabase = await createClient();
  return await supabase.auth.getSession();
}

// Get current user
export async function getUser() {
  const supabase = await createClient();
  return await supabase.auth.getUser();
}