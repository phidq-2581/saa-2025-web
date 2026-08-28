/**
 * Bell icon (A1.6, 40x40) with a prop-driven unread badge. The data source
 * for the unread count is deferred with the notification panel
 * (clarifications.md "Bell renders; badge is prop-driven"); this round only
 * wires the visual state.
 */
export type NotificationBellProps = {
  unreadCount?: number;
};

export function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  return (
    <button
      type="button"
      data-testid="notification-bell"
      aria-label="Notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-chip"
    >
      <img src="/nav/bell.svg" alt="" width={24} height={24} aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          data-testid="notification-badge"
          className="absolute right-2 top-2 h-2 w-2 rounded-pill bg-badge"
        />
      )}
    </button>
  );
}
