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
import { doctorsBrand } from '../doctorsBrand';
import { spacing, radius } from '../../../theme';
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
  favorited?: boolean;
  onToggleFavorite?: (doctor: Doctor) => void;
  onViewProfile?: (doctor: Doctor) => void;
  onBook?: (doctor: Doctor, option: ConsultOption) => void;
};

function experienceLabel(doctor: Doctor) {
  if (doctor.experienceYears > 0) {
    return `${doctor.experienceYears}+ Years Experience`;
  }
  return doctor.experience || 'Experienced';
}

export function DoctorCard({
  doctor,
  consultType,
  hospitalContext = null,
  favorited = false,
  onToggleFavorite,
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
  const primaryFee = bookableOptions[0]?.fee ?? doctor.fee ?? null;

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
        <TouchableOpacity
          style={styles.main}
          activeOpacity={0.88}
          onPress={() => onViewProfile?.(doctor)}
          disabled={!onViewProfile}>
          <Image source={{ uri: doctor.photo }} style={styles.photo} />

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {doctor.name}
              </Text>
              <View style={styles.verified}>
                <Icon name="check" size={10} color={doctorsBrand.onAccent} />
              </View>
            </View>

            <Text style={styles.specialty} numberOfLines={1}>
              {doctor.specialty}
            </Text>

            <View style={styles.expPill}>
              <Text style={styles.expText}>{experienceLabel(doctor)}</Text>
            </View>

            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color={doctorsBrand.star} />
              <Text style={styles.rating}>{doctor.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({doctor.reviews} Reviews)</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.side}>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => onToggleFavorite?.(doctor)}
            hitSlop={8}
            activeOpacity={0.75}>
            <Icon
              name={favorited ? 'heart' : 'heart-outline'}
              size={20}
              color={favorited ? doctorsBrand.danger : doctorsBrand.muted}
            />
          </TouchableOpacity>

          <View style={styles.sideBottom}>
            {doctor.online ? (
              <View style={styles.onlineChip}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            ) : doctor.availableToday ? (
              <Text style={styles.availHint}>Today</Text>
            ) : null}

            {primaryFee != null && primaryFee > 0 ? (
              <Text style={styles.feeHint}>
                PKR {primaryFee.toLocaleString()}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.bookBtn,
                bookableOptions.length === 0 && styles.bookBtnDisabled,
              ]}
              onPress={handleBookClick}
              disabled={bookableOptions.length === 0}
              activeOpacity={0.85}>
              <Text style={styles.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showBookModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowBookModal(false)}>
          <Pressable
            style={styles.modalSheet}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose consultation</Text>
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
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    backgroundColor: doctorsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    padding: spacing.md,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minWidth: 0,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: doctorsBrand.soft,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 5,
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: doctorsBrand.ink,
    letterSpacing: -0.2,
  },
  verified: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: doctorsBrand.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialty: {
    fontSize: 13,
    fontWeight: '500',
    color: doctorsBrand.muted,
  },
  expPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: doctorsBrand.successSoft,
  },
  expText: {
    fontSize: 11,
    fontWeight: '700',
    color: doctorsBrand.success,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: doctorsBrand.ink,
  },
  reviews: {
    fontSize: 12,
    color: doctorsBrand.muted,
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 96,
  },
  heartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBottom: {
    alignItems: 'flex-end',
    gap: 6,
  },
  onlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: doctorsBrand.success,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: doctorsBrand.success,
  },
  availHint: {
    fontSize: 10,
    fontWeight: '700',
    color: doctorsBrand.accentSoft,
  },
  feeHint: {
    fontSize: 11,
    fontWeight: '700',
    color: doctorsBrand.ink,
  },
  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: doctorsBrand.accent,
    backgroundColor: doctorsBrand.card,
  },
  bookBtnDisabled: {
    opacity: 0.4,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: doctorsBrand.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 69, 84, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: doctorsBrand.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: doctorsBrand.mist,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: doctorsBrand.ink,
  },
  modalSub: {
    fontSize: 14,
    color: doctorsBrand.muted,
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
