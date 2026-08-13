import { Alert, type AlertButton } from 'react-native';

export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AppAlertConfig = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
};

type AlertHandler = (config: AppAlertConfig) => void;

let handler: AlertHandler | null = null;
const queue: AppAlertConfig[] = [];

export function registerAppAlert(next: AlertHandler) {
  handler = next;
  while (queue.length > 0) {
    const item = queue.shift();
    if (item) next(item);
  }
}

export function unregisterAppAlert() {
  handler = null;
}

function presentAlert(config: AppAlertConfig) {
  if (handler) {
    handler(config);
    return;
  }
  queue.push(config);
}

/** Drop-in replacement for Alert.alert with the same signature. */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  _options?: { cancelable?: boolean; onDismiss?: () => void },
) {
  const normalized =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: 'OK', style: 'default' as const }];
  presentAlert({
    title,
    message,
    buttons: normalized,
  });
}

let installed = false;

/** Patches React Native Alert.alert so every existing call uses the branded dialog. */
export function installGlobalAppAlert() {
  if (installed) return;
  installed = true;

  const nativeAlert = Alert.alert.bind(Alert);
  Alert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean; onDismiss?: () => void },
  ) => {
    appAlert(title, message, buttons as AppAlertButton[] | undefined, options);
  };

  // Keep native fallback available for emergencies.
  (Alert as { __nativeAlert?: typeof nativeAlert }).__nativeAlert = nativeAlert;
}

export { appAlert as AppAlert };
