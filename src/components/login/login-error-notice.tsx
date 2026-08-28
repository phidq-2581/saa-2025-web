export type LoginErrorNoticeProps = {
  errorCode?: string;
};

const KNOWN_ERROR_CODES = ["domain", "exchange_failed", "missing_code"];

/**
 * OAuth failure banner (mms_B.3_Login validation note, US002 AS1). One
 * error copy for every callback failure (domain rejection, session
 * exchange failure, missing code) -- clarifications.md: a user must not
 * be able to infer from the message which check failed. No Figma node --
 * this state isn't in the base screenshot, only in the spec's validation
 * note -- so there's no mm:{nodeId} to anchor to.
 */
export function LoginErrorNotice({ errorCode }: LoginErrorNoticeProps) {
  if (!errorCode || !KNOWN_ERROR_CODES.includes(errorCode)) {
    return null;
  }

  return (
    <p data-testid="login-error-notice" className="font-body text-sm font-bold text-badge">
      Đăng nhập không thành công. Vui lòng thử lại.
    </p>
  );
}
