import React, { useCallback, useEffect, useState } from 'react';
import { AppDialog } from './AppDialog';
import {
  registerAppAlert,
  unregisterAppAlert,
  type AppAlertConfig,
} from '../../lib/ui/appAlert';

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppAlertConfig | null>(null);

  const show = useCallback((next: AppAlertConfig) => {
    setConfig(next);
  }, []);

  const dismiss = useCallback(() => {
    setConfig(null);
  }, []);

  useEffect(() => {
    registerAppAlert(show);
    return () => unregisterAppAlert();
  }, [show]);

  return (
    <>
      {children}
      <AppDialog
        visible={Boolean(config)}
        title={config?.title ?? ''}
        message={config?.message}
        buttons={config?.buttons}
        onDismiss={dismiss}
      />
    </>
  );
}
