import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

/**
 * E2E session fixture (F1/A4/A6, phase-03 § "E2E session fixture mechanism").
 * Node-side only, runs against LOCAL Supabase; the service-role key is
 * never imported from `src/` (ESLint boundary, S4).
 *
 * Mechanism: admin.createUser (idempotent) -> admin.generateLink(magiclink)
 * -> anon-key verifyOtp(token_hash) -> a real session -> serialize into the
 * exact @supabase/ssr cookie format by feeding it through a real
 * `createServerClient(...).auth.setSession()` call and capturing whatever
 * `setAll` receives. This derives the cookie name/value/options the same
 * way the app itself would, rather than hand-rolling the serialization --
 * verified empirically (probe script) to produce `sb-127-auth-token` for
 * `http://127.0.0.1:54321`, i.e. the project ref is the first dot-segment
 * of the Supabase URL's hostname.
 */

export interface SeededCookie {
  name: string;
  value: string;
  path: string;
  sameSite: string | undefined;
  httpOnly: boolean;
  secure: boolean;
  maxAge: number | undefined;
}

export interface SeededSession {
  userId: string;
  email: string;
  cookies: SeededCookie[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`seed-session: missing required env var ${name}`);
  }
  return value;
}

function extractTokenHashFromActionLink(actionLink: string | undefined): string | null {
  if (!actionLink) {
    return null;
  }
  try {
    const parsed = new URL(actionLink);
    return parsed.searchParams.get("token") ?? parsed.searchParams.get("token_hash");
  } catch {
    return null;
  }
}

async function findOrCreateUser(
  admin: SupabaseClient,
  email: string,
): Promise<User> {
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: "E2E Sunner", avatar_url: null },
  });
  if (!createErr && created.user) {
    return created.user;
  }

  // Idempotent: a prior/parallel run may already have created this email.
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    throw new Error(
      `seed-session: createUser failed (${createErr?.message}) and listUsers failed (${listErr.message})`,
    );
  }
  const existing = listData.users.find((candidate) => candidate.email === email);
  if (!existing) {
    throw new Error(
      `seed-session: createUser failed (${createErr?.message}) and no existing user with email ${email} was found`,
    );
  }
  return existing;
}

async function deriveSsrCookies(
  url: string,
  anonKey: string,
  session: { access_token: string; refresh_token: string },
): Promise<SeededCookie[]> {
  let captured: SeededCookie[] = [];
  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => [],
      setAll: (cookiesToSet) => {
        captured = cookiesToSet.map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
          path: (cookie.options?.path as string | undefined) ?? "/",
          sameSite: cookie.options?.sameSite as string | undefined,
          httpOnly: Boolean(cookie.options?.httpOnly),
          secure: Boolean(cookie.options?.secure),
          maxAge: cookie.options?.maxAge as number | undefined,
        }));
      },
    },
  });
  await client.auth.setSession(session);
  return captured;
}

/**
 * Seeds a real local Supabase session for `email` and returns the exact
 * `@supabase/ssr` cookie(s) to hand to `context.addCookies()`. Sets
 * `profile.role` for the user when `role !== 'member'` (member is the
 * trigger's own default -- no write needed).
 */
export async function seedSession(
  email: string,
  role: "admin" | "member" = "member",
): Promise<SeededSession> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const secretKey = requireEnv("SUPABASE_SECRET_KEY");

  const admin: SupabaseClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const user = await findOrCreateUser(admin, email);

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !linkData) {
    throw new Error(`seed-session: generateLink failed: ${linkErr?.message ?? "no data"}`);
  }

  // A6: response shape probe -- fail loudly rather than silently producing
  // an invalid session if supabase-js's generateLink shape ever drifts.
  const tokenHash =
    linkData.properties?.hashed_token ?? extractTokenHashFromActionLink(linkData.properties?.action_link);
  if (!tokenHash) {
    throw new Error(
      "seed-session: generateLink response has neither properties.hashed_token nor a " +
        "parseable action_link token -- response shape has drifted (research-01 § Unresolved)",
    );
  }

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: otpData, error: otpErr } = await anon.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (otpErr || !otpData.session) {
    throw new Error(`seed-session: verifyOtp failed: ${otpErr?.message ?? "no session"}`);
  }

  if (role !== "member") {
    const { error: roleErr } = await admin.from("profile").update({ role }).eq("id", user.id);
    if (roleErr) {
      throw new Error(`seed-session: failed to set profile.role=${role} for ${user.id}: ${roleErr.message}`);
    }
  }

  const cookies = await deriveSsrCookies(url, anonKey, otpData.session);
  return { userId: user.id, email, cookies };
}

/** Cleanup: deletes a user created by `seedSession`. */
export async function deleteSeededUser(userId: string): Promise<void> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const secretKey = requireEnv("SUPABASE_SECRET_KEY");
  const admin: SupabaseClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    // Cleanup failure must not fail the test run -- log and move on, a
    // leftover local-only E2E user is a minor annoyance, not a correctness
    // issue for the suite that just ran.
    console.warn(`seed-session: cleanup failed for user ${userId}: ${error.message}`);
  }
}
