"use client";

import { useFormStatus } from "react-dom";

type GoogleSignInButtonProps = {
  action: (next?: string) => Promise<void>;
  label: string;
  next?: string;
};

/**
 * `useFormStatus` only reads the *enclosing* <form>'s pending state, so
 * the button needs to be its own child component -- reading it directly
 * in GoogleSignInButton would always report the parent form's status as
 * not-pending (there is no enclosing form at that scope yet).
 */
function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    // mm:662:14426
    <button
      type="submit"
      disabled={pending}
      data-testid="google-sign-in-button"
      className="flex items-center gap-2 rounded-lg bg-gold px-6 py-4 font-body text-[22px] font-bold leading-7 text-canvas disabled:opacity-70"
    >
      <span>{label}</span>
      {pending ? (
        <span
          aria-hidden="true"
          className="h-6 w-6 animate-spin rounded-full border-2 border-canvas/30 border-t-canvas"
        />
      ) : (
        // mm:I662:14426;186:1766 -- multi-colour Google "G", kept as its
        // original palette per code-rules 2a (not converted to currentColor).
        // Trails the label: get_node(662:14426).childIds is
        // ["I662:14426;186:1935" (text), "I662:14426;186:1766" (icon)], so
        // the design order is text-then-icon, not icon-then-text.
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20.8245 12.2073C20.8245 11.5955 20.7748 10.9804 20.669 10.3785H12.1799V13.8443H17.0412C16.8395 14.962 16.1913 15.9508 15.2422 16.5792V18.8279H18.1425C19.8456 17.2604 20.8245 14.9455 20.8245 12.2073Z"
            fill="#4285F4"
          />
          <path
            d="M12.1799 21.0006C14.6073 21.0006 16.6543 20.2036 18.1458 18.8279L15.2455 16.5792C14.4386 17.1281 13.3969 17.439 12.1832 17.439C9.83527 17.439 7.84445 15.8549 7.13014 13.7252H4.1373V16.0434C5.66514 19.0826 8.77703 21.0006 12.1799 21.0006Z"
            fill="#34A853"
          />
          <path
            d="M7.12684 13.7252C6.74984 12.6074 6.74984 11.3971 7.12684 10.2793V7.96112H4.13731C2.86081 10.5042 2.8608 13.5003 4.1373 16.0434L7.12684 13.7252Z"
            fill="#FBBC04"
          />
          <path
            d="M12.1799 6.56224C13.463 6.5424 14.7032 7.02523 15.6324 7.9115L18.202 5.34196C16.5749 3.81413 14.4155 2.97415 12.1799 3.00061C8.77702 3.00061 5.66515 4.91868 4.13731 7.96112L7.12684 10.2793C7.83785 8.14631 9.83196 6.56224 12.1799 6.56224Z"
            fill="#EA4335"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * mms_B.3_Login (662:14425) -- the single Google OAuth trigger. `next` is
 * bound onto the server action (`action.bind(null, next)`) so a plain
 * form submit resolves it, and mirrored into a hidden input so the value
 * still travels in FormData. The E2E suite never clicks this button
 * (Phase 07 owns the click-through assertion); this only proves the
 * enabled/pending markup contract.
 */
export function GoogleSignInButton({ action, label, next }: GoogleSignInButtonProps) {
  const boundAction = action.bind(null, next);

  return (
    // mm:662:14425
    <form action={boundAction}>
      <input type="hidden" name="next" value={next ?? ""} />
      <SubmitButton label={label} />
    </form>
  );
}
