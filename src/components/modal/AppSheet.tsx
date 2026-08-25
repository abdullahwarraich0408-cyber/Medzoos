import React from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../theme';
import { KeyboardAvoidingContainer } from '../keyboard';

type AppSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max height fraction, e.g. 0.9 */
  maxHeight?: `${number}%`;
  contentStyle?: ViewStyle;
};

export function AppSheet({
  visible,
  onClose,
  children,
  maxHeight = '90%',
  contentStyle,
}: AppSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingContainer enabled={visible} style={styles.sheetLift}>
          <View style={[styles.sheet, { maxHeight }, contentStyle]}>
            <View style={styles.handle} />
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Icon name="close" size={22} color={colors.neutral500} />
            </Pressable>
            {children}
          </View>
        </KeyboardAvoidingContainer>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 26, 46, 0.55)',
  },
  sheetLift: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.08)',
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral200,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
