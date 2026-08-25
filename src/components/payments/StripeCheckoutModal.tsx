import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../theme';
import {
  extractStripeSessionId,
  isStripeCancelReturnUrl,
  isStripeSuccessReturnUrl,
  verifyStripePayment,
} from '../../lib/payments/stripeCheckout';

type StripeCheckoutModalProps = {
  visible: boolean;
  checkoutUrl: string | null;
  onPaid: (sessionId: string) => void;
  onCancelled: () => void;
  onError: (message: string) => void;
};

export function StripeCheckoutModal({
  visible,
  checkoutUrl,
  onPaid,
  onCancelled,
  onError,
}: StripeCheckoutModalProps) {
  const insets = useSafeAreaInsets();
  const handledRef = useRef(false);
  const [verifying, setVerifying] = useState(false);

  const finishPaid = useCallback(
    async (sessionId: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      setVerifying(true);
      try {
        const result = await verifyStripePayment(sessionId);
        if (!result.paid) {
          handledRef.current = false;
          onError('Payment was not completed. Please try again.');
          return;
        }
        onPaid(sessionId);
      } catch (error) {
        handledRef.current = false;
        onError(
          error instanceof Error
            ? error.message
            : 'Could not verify Stripe payment.',
        );
      } finally {
        setVerifying(false);
      }
    },
    [onError, onPaid],
  );

  const handleNav = useCallback(
    (nav: WebViewNavigation) => {
      const url = nav.url || '';
      if (!url || handledRef.current) return;

      if (isStripeCancelReturnUrl(url)) {
        handledRef.current = true;
        onCancelled();
        return;
      }

      if (isStripeSuccessReturnUrl(url)) {
        const sessionId = extractStripeSessionId(url);
        if (sessionId) {
          void finishPaid(sessionId);
        }
      }
    },
    [finishPaid, onCancelled],
  );

  const handleClose = () => {
    if (verifying) return;
    handledRef.current = true;
    onCancelled();
  };

  // Reset guard when a new checkout opens
  React.useEffect(() => {
    if (visible && checkoutUrl) {
      handledRef.current = false;
      setVerifying(false);
    }
  }, [visible, checkoutUrl]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen">
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Secure card payment</Text>
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            disabled={verifying}
            accessibilityRole="button"
            accessibilityLabel="Close Stripe checkout">
            <Icon name="close" size={22} color={colors.inkHeadline} />
          </Pressable>
        </View>

        {verifying || !checkoutUrl ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandPrimary} />
            <Text style={styles.hint}>
              {verifying ? 'Confirming payment…' : 'Loading Stripe…'}
            </Text>
          </View>
        ) : (
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleNav}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator color={colors.brandPrimary} />
              </View>
            )}
            style={styles.webview}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  hint: {
    fontSize: 14,
    color: colors.neutral500,
  },
});
