import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { createKudosSeeder, createAnonClient } from "./support/seed-kudos";

/**
 * Phase 01 (F005/F006) RED probe -- proves the kudos schema/RLS contract
 * `data-model.md` describes, before any migration exists. Each test seeds
 * and tears down its own throwaway users/kudos (fullyParallel-safe, no
 * global fixture, no `count(*)` assertion against shared state).
 */
test.describe("Kudos schema fixture", () => {
  test("kudos_card_view aggregates correct heart counts and orders top-5 by hearts", async () => {
    const seeder = createKudosSeeder();
    try {
      const sender = await seeder.createUser("kudos-sender");
      const receiver = await seeder.createUser("kudos-receiver");
      const reader = await seeder.createActor("kudos-reader");
      const hashtagIds = await seeder.fetchHashtagIds(2);
      expect(hashtagIds.length).toBeGreaterThan(0);

      // 6 kudos with a distinct, known heart count each (0..5) so top-5
      // ordering is unambiguous.
      const heartCounts = [0, 1, 2, 3, 4, 5];
      const kudosIds: string[] = [];
      for (const count of heartCounts) {
        const kudosId = await seeder.seedKudos({ senderId: sender, receiverId: receiver, hashtagIds });
        kudosIds.push(kudosId);
        for (let i = 0; i < count; i++) {
          const liker = await seeder.createUser(`kudos-liker-${count}-${i}`);
          await seeder.seedHeart({ kudosId, userId: liker, grantedAmount: 1 });
        }
      }

      const { data, error } = await reader.client
        .from("kudos_card_view")
        .select("id, heart_count, hashtag_ids, hashtag_names, image_paths")
        .in("id", kudosIds)
        .order("heart_count", { ascending: false })
        .limit(5);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      const rows = data!;
      expect(rows.map((row) => row.heart_count)).toEqual([5, 4, 3, 2, 1]);
      expect(rows[0].id).toBe(kudosIds[5]);
      expect(rows[0].hashtag_ids.length).toBe(hashtagIds.length);

      // security_invoker + `authenticated`-only grant: an anon client must
      // not be able to read the view at all.
      const anon = createAnonClient();
      const { data: anonData, error: anonError } = await anon
        .from("kudos_card_view")
        .select("id")
        .in("id", kudosIds);
      expect(anonError !== null || (anonData ?? []).length === 0).toBe(true);
    } finally {
      await seeder.cleanup();
    }
  });

  test("create_kudos rolls back the whole insert when the hashtag count is invalid", async () => {
    const seeder = createKudosSeeder();
    try {
      const actor = await seeder.createActor("kudos-writer");
      const receiver = await seeder.createUser("kudos-invalid-receiver");
      const probeId = randomUUID();

      const { error } = await actor.client.rpc("create_kudos", {
        p_id: probeId,
        p_receiver: receiver,
        p_content: { type: "doc", content: [] },
        p_is_anonymous: false,
        p_display_name: null,
        p_hashtag_ids: [],
        p_image_paths: [],
      });
      expect(error).not.toBeNull();

      // Atomicity proof: the kudos insert inside the failed function call
      // must have rolled back along with the hashtag-count guard.
      const { data: rolledBack, error: readError } = await actor.client
        .from("kudos")
        .select("id")
        .eq("id", probeId);
      expect(readError).toBeNull();
      expect(rolledBack ?? []).toEqual([]);
    } finally {
      await seeder.cleanup();
    }
  });

  test("create_kudos inserts kudos + kudos_hashtag atomically for a valid call", async () => {
    const seeder = createKudosSeeder();
    try {
      const actor = await seeder.createActor("kudos-valid-writer");
      const receiver = await seeder.createUser("kudos-valid-receiver");
      const hashtagIds = await seeder.fetchHashtagIds(2);
      const probeId = randomUUID();

      const { error } = await actor.client.rpc("create_kudos", {
        p_id: probeId,
        p_receiver: receiver,
        p_content: { type: "doc", content: [] },
        p_is_anonymous: false,
        p_display_name: null,
        p_hashtag_ids: hashtagIds,
        p_image_paths: [],
      });
      expect(error).toBeNull();

      const { data, error: readError } = await actor.client
        .from("kudos_hashtag")
        .select("hashtag_id")
        .eq("kudos_id", probeId);
      expect(readError).toBeNull();
      expect((data ?? []).length).toBe(hashtagIds.length);
    } finally {
      await seeder.cleanup();
    }
  });

  test("a self-heart insert is rejected by RLS", async () => {
    const seeder = createKudosSeeder();
    try {
      const sender = await seeder.createActor("kudos-self-heart-sender");
      const receiver = await seeder.createUser("kudos-self-heart-receiver");
      const kudosId = await seeder.seedKudos({
        senderId: sender.userId,
        receiverId: receiver,
        hashtagIds: await seeder.fetchHashtagIds(1),
      });

      const { error } = await sender.client
        .from("heart")
        .insert({ kudos_id: kudosId, user_id: sender.userId, granted_amount: 1 });
      expect(error).not.toBeNull();
    } finally {
      await seeder.cleanup();
    }
  });

  test("a second heart for the same (kudos, user) pair violates the primary key", async () => {
    const seeder = createKudosSeeder();
    try {
      const sender = await seeder.createUser("kudos-dup-heart-sender");
      const receiver = await seeder.createUser("kudos-dup-heart-receiver");
      const liker = await seeder.createActor("kudos-dup-heart-liker");
      const kudosId = await seeder.seedKudos({
        senderId: sender,
        receiverId: receiver,
        hashtagIds: await seeder.fetchHashtagIds(1),
      });

      const first = await liker.client
        .from("heart")
        .insert({ kudos_id: kudosId, user_id: liker.userId, granted_amount: 1 });
      expect(first.error).toBeNull();

      const second = await liker.client
        .from("heart")
        .insert({ kudos_id: kudosId, user_id: liker.userId, granted_amount: 1 });
      expect(second.error).not.toBeNull();
    } finally {
      await seeder.cleanup();
    }
  });
});
