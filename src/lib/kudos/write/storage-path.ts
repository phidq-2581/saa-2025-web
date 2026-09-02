/**
 * Phase 05 (data-model.md § Storage): path convention
 * `kudos/{sender_id}/{kudos_id}/{position}-{filename}`. The builder
 * sanitizes a user-supplied filename (untrusted input) so it can never add
 * an extra path segment; the verifier is the action's defense against a
 * client attaching another Sunner's object path to its own kudos.
 */

const SEGMENT_PREFIX = "kudos";

function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.length > 0 ? cleaned : "file";
}

export interface BuildKudosImageStoragePathParams {
  senderId: string;
  kudosId: string;
  position: number;
  fileName: string;
}

export function buildKudosImageStoragePath(params: BuildKudosImageStoragePathParams): string {
  const safeFileName = sanitizeFileName(params.fileName);
  return `${SEGMENT_PREFIX}/${params.senderId}/${params.kudosId}/${params.position}-${safeFileName}`;
}

export interface VerifyKudosImageStoragePathParams {
  storagePath: string;
  senderId: string;
  kudosId: string;
}

/**
 * A storage path is only trusted when it sits exactly inside the caller's
 * own `{sender}/{kudos}/` scope, with no traversal segment and exactly one
 * filename segment left over. The trailing slash on `expectedPrefix`
 * already guards against a same-prefix-different-id collision (e.g.
 * sender `abc` vs a hostile `abcdef`), since the character right after the
 * shared prefix must be `/`.
 */
export function verifyKudosImageStoragePath(params: VerifyKudosImageStoragePathParams): boolean {
  const { storagePath, senderId, kudosId } = params;

  if (storagePath.includes("..")) {
    return false;
  }

  const expectedPrefix = `${SEGMENT_PREFIX}/${senderId}/${kudosId}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return false;
  }

  const remainder = storagePath.slice(expectedPrefix.length);
  return remainder.length > 0 && !remainder.includes("/");
}
