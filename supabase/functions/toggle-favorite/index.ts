// / <reference path="../edge-runtime.d.ts" />
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

type ToggleFavoriteRequest = {
  item_id?: string;
};

type ToggleFavoriteResponse = {
  item_id: string;
  favorited: boolean;
};

type ErrorResponse = {
  error: string;
};

function jsonResponse(body: ToggleFavoriteResponse | ErrorResponse, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = (await req.json()) as ToggleFavoriteRequest;
    const itemId = body.item_id?.trim();

    if (!itemId) {
      return jsonResponse({ error: 'item_id is required' }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: existing, error: selectError } = await adminClient
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .maybeSingle();

    if (selectError) {
      return jsonResponse({ error: selectError.message }, 500);
    }

    if (existing) {
      const { error: deleteError } = await adminClient
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        return jsonResponse({ error: deleteError.message }, 500);
      }

      return jsonResponse({ item_id: itemId, favorited: false }, 200);
    }

    const { error: insertError } = await adminClient.from('favorites').insert({
      user_id: user.id,
      item_id: itemId,
    });

    if (insertError) {
      return jsonResponse({ error: insertError.message }, 500);
    }

    return jsonResponse({ item_id: itemId, favorited: true }, 200);
  } catch {
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
});
