import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows, cardStyles } from '../../../theme';
import type { Doctor } from '../../../lib/mappers/doctor';
import type { ConsultType } from '../data/mockDoctors';
import {
  buildDoctorConsultOptions,
  filterConsultOptions,
  type ConsultOption,
} from '../utils/consultOptions';
import { ConsultOptionRow } from './ConsultOptionRow';

type DoctorCardProps = {
  doctor: Doctor;
  consultType: ConsultType;
  hospitalContext?: string | null;
  onViewProfile?: (doctor: Doctor) => void;
  onBook?: (doctor: Doctor, option: ConsultOption) => void;
};

export function DoctorCard({
  doctor,
  consultType,
  hospitalContext = null,
  onViewProfile,
  onBook,
}: DoctorCardProps) {
  const [showBookModal, setShowBookModal] = useState(false);
  const isOnlineTab = consultType === 'online';

  const allOptions = useMemo(
    () => buildDoctorConsultOptions(doctor, hospitalContext),
    [doctor, hospitalContext],
  );
  const options = useMemo(
    () => filterConsultOptions(allOptions, consultType),
    [allOptions, consultType],
  );
  const onlineOption = options.find(o => o.type === 'online');
  const inPersonOptions = options.filter(o => o.type === 'in_person');
  const displayOptions = isOnlineTab
    ? onlineOption
      ? [onlineOption]
      : []
    : inPersonOptions;
  const bookableOptions = displayOptions;

  const handleBookClick = () => {
    if (bookableOptions.length > 1) {
      setShowBookModal(true);
      return;
    }
    if (bookableOptions[0]) {
      onBook?.(doctor, bookableOptions[0]);
    }
  };

  const handleSelectOption = (option: ConsultOption) => {
    setShowBookModal(false);
    onBook?.(doctor, option);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={onViewProfile ? 0.85 : 1}
            onPress={() => onViewProfile?.(doctor)}
            disabled={!onViewProfile}>
            <View style={styles.photoWrap}>
              <Image source={{ uri: doctor.photo }} style={styles.photo} />
              {doctor.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{doctor.name}</Text>
              <Text style={styles.specialty}>{doctor.specialty}</Text>
              <Text style={styles.qualification} numberOfLines={2}>
                {doctor.qualifications?.[0] || doctor.hospital}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.experience}>{doctor.experience}</Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={14} color={colors.rating} />
                  <Text style={styles.rating}>{doctor.rating}</Text>
                  <Text style={styles.reviews}>({doctor.reviews} Reviews)</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.actions}>
            {isOnlineTab && onlineOption && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => onBook?.(doctor, onlineOption)}
                activeOpacity={0.85}>
                <Icon name="video" size={16} color={colors.brandPrimary} />
                <Text style={styles.secondaryBtnText}>Video</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                bookableOptions.length === 0 && styles.primaryBtnDisabled,
              ]}
              onPress={handleBookClick}
              disabled={bookableOptions.length === 0}
              activeOpacity={0.85}>
              <Icon name="calendar" size={16} color={colors.white} />
              <Text style={styles.primaryBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>

        {displayOptions.length > 0 && (
          <View style={styles.options}>
            {displayOptions.map(option => (
              <ConsultOptionRow
                key={option.id}
                option={option}
                compact
                onPress={opt => onBook?.(doctor, opt)}
              />
            ))}
          </View>
        )}
      </View>

      <Modal
        visible={showBookModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowBookModal(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose consultation type</Text>
            <Text style={styles.modalSub}>{doctor.name}</Text>
            <ScrollView style={styles.modalList}>
              {bookableOptions.map(option => (
                <View key={option.id} style={styles.modalOption}>
                  <ConsultOptionRow
                    option={option}
                    onPress={handleSelectOption}
                  />
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.listCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  topRow: {
    gap: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  photoWrap: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.neutral100,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.statusSuccess,
    borderWidth: 2,
    borderColor: colors.white,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  specialty: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 2,
  },
  qualification: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 4,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  experience: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkHeadline,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  reviews: {
    fontSize: 12,
    color: colors.neutral500,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    backgroundColor: colors.white,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  options: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12,26,46,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral300,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  modalSub: {
    fontSize: 14,
    color: colors.neutral500,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  modalList: {
    maxHeight: 360,
  },
  modalOption: {
    marginBottom: spacing.sm,
  },
});
