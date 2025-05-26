import { createClient } from '@supabase/supabase-js';
import { env } from '~/env';

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    'WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined. Supabase admin client might not function as expected for all operations.'
  );
}

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ||
    'YOUR_FALLBACK_OR_EMPTY_STRING_IF_ABSOLUTELY_NECESSARY_BUT_NOT_RECOMMENDED'
);
