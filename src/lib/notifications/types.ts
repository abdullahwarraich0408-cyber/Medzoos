export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: string;
  data?: Record<string, string>;
};

export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'not_determined'
  | 'provisional';
