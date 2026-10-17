import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvwmkoshkkzupgrjcttx.supabase.co';

const supabasePublishableKey =
  'sb_publishable_ojrPvKcGUnlIGvxwVx2f3Q_DDtp3mk8';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
