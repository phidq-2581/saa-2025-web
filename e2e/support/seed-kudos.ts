import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Phase 01 (F005/F006) kudos schema/RLS probe fixture. Service-role helper
 * that seeds kudos, hashtag links, hearts and `special_days` rows for a
 * caller-supplied set of throwaway users, plus `createActor()` for tests
 * that must exercise RLS as a real authenticated user (not the
 * service-role bypass). Per-test isolation only -- every caller gets its
 * own seeder instance and must call `cleanup()`; no shared/global fixture.
 * `createActor()` mirrors `seed-session.ts`'s magiclink -> verifyOtp
 * mechanism but returns a live `SupabaseClient` instead of serialized SSR
 * cookies -- this module talks to Postgres/PostgREST directly, not the app.
 */

export interface KudosActor {
  userId: string;
  email: string;
  client: SupabaseClient;
}

export interface KudosSeed {
  senderId: string;
  receiverId: string;
  hashtagIds: string[];
  isAnonymous?: boolean;
  anonymousDisplayName?: string | null;
  createdAt?: string;
}

export interface HeartSeed {
  kudosId: string;
  userId: string;
  grantedAmount: 1 | 2;
}

const DEFAULT_CONTENT = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Great work!" }] }],
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`seed-kudos: missing required env var ${name}`);
  }
  return value;
}

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@sun-asterisk.com`;
}

function adminClient(): SupabaseClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createKudosSeeder() {
  const admin = adminClient();
  const createdUserIds: string[] = [];
  const createdKudosIds: string[] = [];
  const createdSpecialDays: string[] = [];

  async function createUser(emailPrefix: string): Promise<string> {
    const { userId } = await createUserWithEmail(emailPrefix);
    return userId;
  }

  async function createUserWithEmail(emailPrefix: string): Promise<{ userId: string; email: string }> {
    const email = uniqueEmail(emailPrefix);
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: `Kudos E2E ${emailPrefix}`, avatar_url: null },
    });
    if (error || !data.user) {
      throw new Error(`seed-kudos: failed to create user ${email}: ${error?.message ?? "no user"}`);
    }
    createdUserIds.push(data.user.id);
    return { userId: data.user.id, email };
  }

  // A real authenticated session (not the service-role bypass), for tests
  // that must exercise RLS as a specific user. Mirrors seed-session.ts's
  // magiclink -> verifyOtp mechanism, returning a live client instead of
  // serialized SSR cookies.
  async function createActor(emailPrefix: string): Promise<KudosActor> {
    const { userId, email } = await createUserWithEmail(emailPrefix);
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = linkData?.properties?.hashed_token;
    if (linkErr || !tokenHash) {
      throw new Error(`seed-kudos: generateLink failed for ${email}: ${linkErr?.message ?? "no token hash"}`);
    }

    const client = createAnonClient();
    const { data: otpData, error: otpErr } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });
    if (otpErr || !otpData.session) {
      throw new Error(`seed-kudos: verifyOtp failed for ${email}: ${otpErr?.message ?? "no session"}`);
    }

    return { userId, email, client };
  }

  async function seedKudos(seed: KudosSeed): Promise<string> {
    const { data, error } = await admin
      .from("kudos")
      .insert({
        sender_id: seed.senderId,
        receiver_id: seed.receiverId,
        content: DEFAULT_CONTENT,
        is_anonymous: seed.isAnonymous ?? false,
        anonymous_display_name: seed.anonymousDisplayName ?? null,
        ...(seed.createdAt ? { created_at: seed.createdAt } : {}),
      })
      .select("id")
      .single();
    if (error || !data) {
      throw new Error(`seed-kudos: failed to insert kudos: ${error?.message ?? "no data"}`);
    }
    createdKudosIds.push(data.id as string);

    if (seed.hashtagIds.length > 0) {
      const { error: tagErr } = await admin
        .from("kudos_hashtag")
        .insert(seed.hashtagIds.map((hashtagId) => ({ kudos_id: data.id, hashtag_id: hashtagId })));
      if (tagErr) {
        throw new Error(`seed-kudos: failed to insert kudos_hashtag: ${tagErr.message}`);
      }
    }
    return data.id as string;
  }

  async function seedHeart(heart: HeartSeed): Promise<void> {
    const { error } = await admin.from("heart").insert({
      kudos_id: heart.kudosId,
      user_id: heart.userId,
      granted_amount: heart.grantedAmount,
    });
    if (error) {
      throw new Error(`seed-kudos: failed to insert heart: ${error.message}`);
    }
  }

  async function seedSpecialDay(day: string): Promise<void> {
    const { error } = await admin.from("special_days").insert({ day });
    if (error) {
      throw new Error(`seed-kudos: failed to insert special_days: ${error.message}`);
    }
    createdSpecialDays.push(day);
  }

  async function fetchHashtagIds(limit = 5): Promise<string[]> {
    const { data, error } = await admin.from("hashtag").select("id").limit(limit);
    if (error || !data) {
      throw new Error(`seed-kudos: failed to fetch hashtag ids: ${error?.message ?? "no data"}`);
    }
    return data.map((row) => row.id as string);
  }

  async function cleanup(): Promise<void> {
    if (createdKudosIds.length > 0) {
      // Cascades kudos_hashtag / kudos_image / heart.
      const { error } = await admin.from("kudos").delete().in("id", createdKudosIds);
      if (error) {
        console.warn(`seed-kudos: cleanup failed for kudos ${createdKudosIds.join(",")}: ${error.message}`);
      }
    }
    if (createdSpecialDays.length > 0) {
      const { error } = await admin.from("special_days").delete().in("day", createdSpecialDays);
      if (error) {
        console.warn(`seed-kudos: cleanup failed for special_days ${createdSpecialDays.join(",")}: ${error.message}`);
      }
    }
    for (const userId of createdUserIds) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) {
        console.warn(`seed-kudos: cleanup failed for user ${userId}: ${error.message}`);
      }
    }
  }

  return { createUser, createActor, seedKudos, seedHeart, seedSpecialDay, fetchHashtagIds, cleanup };
}

export function createAnonClient(): SupabaseClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
