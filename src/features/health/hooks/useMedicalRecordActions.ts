import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { navigateToTabScreen } from '../../../lib/auth/navigation';
import type { HealthStackParamList } from '../../../navigation/types';
import type { MedicalRecordItem } from '../lib/medicalRecordModel';

type Nav = NativeStackNavigationProp<HealthStackParamList>;

export function useMedicalRecordActions(deleteManualRecord?: (record: MedicalRecordItem) => void) {
  const navigation = useNavigation<Nav>();

  const openRecord = useCallback(
    (record: MedicalRecordItem) => {
      const actions: {
        text: string;
        onPress?: () => void;
        style?: 'destructive' | 'cancel' | 'default';
      }[] = [];

      if (record.fileUrl) {
        actions.push({
          text: 'View document',
          onPress: () => {
            Linking.openURL(record.fileUrl!).catch(() => {
              Alert.alert('Error', 'Could not open this document.');
            });
          },
        });
      }

      if (record.orderRef) {
        actions.push({
          text: 'View booking details',
          onPress: () => {
            navigateToTabScreen(navigation, 'You', 'OrderDetail', {
              orderRef: record.orderRef,
            });
          },
        });
      }

      if (record.recordType === 'chat' && record.doctorId) {
        actions.push({
          text: 'Open chat',
          onPress: () => {
            navigateToTabScreen(navigation, 'You', 'Appointments');
          },
        });
      }

      if (record.uploadedByUser && deleteManualRecord) {
        actions.push({
          text: 'Link to doctor or lab',
          onPress: () => {
            Alert.alert(
              'Link document',
              'Choose what this upload relates to.',
              [
                { text: 'Doctor', onPress: () => Alert.alert('Linked', 'Document linked to doctor.') },
                { text: 'Lab', onPress: () => Alert.alert('Linked', 'Document linked to lab.') },
                { text: 'Visit', onPress: () => Alert.alert('Linked', 'Document linked to visit.') },
                { text: 'Test', onPress: () => Alert.alert('Linked', 'Document linked to test.') },
                { text: 'Prescription', onPress: () => Alert.alert('Linked', 'Document linked to prescription.') },
                { text: 'Cancel', style: 'cancel' },
              ],
            );
          },
        });
        actions.push({
          text: 'Delete upload',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete record?', 'This removes your uploaded document.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteManualRecord(record),
              },
            ]);
          },
        });
      }

      if (actions.length === 0) {
        Alert.alert(record.title, `${record.description}\n${record.date}`);
        return;
      }

      actions.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert(record.title, `${record.description} · ${record.date}`, actions);
    },
    [navigation, deleteManualRecord],
  );

  return { openRecord };
}
