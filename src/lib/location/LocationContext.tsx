import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { LocationPermissionModal } from '../../components/location/LocationPermissionModal';
import {
  DEFAULT_LOCATION,
  getSavedLocation,
  getSavedLocationDetail,
  hasSeenLocationPrompt,
  markLocationPromptSeen,
  saveLocation,
} from './locationStorage';
import { detectUserLocation, openLocationSettings } from './requestLocation';
import type { DetectedLocation } from './types';

export type LocationDetectionResult = {
  city: string | null;
  address: DetectedLocation | null;
  declined: boolean;
  error?: string;
};

type LocationContextValue = {
  location: string;
  detectedAddress: DetectedLocation | null;
  setLocation: (location: DetectedLocation) => Promise<void>;
  /** Always shows allow/decline modal before accessing device location. */
  requestLocationDetection: () => Promise<LocationDetectionResult>;
};

type LocationController = LocationContextValue & {
  showModal: boolean;
  loading: boolean;
  handleAllow: () => Promise<void>;
  handleDecline: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const FIRST_LAUNCH_MODAL_DELAY_MS = 900;

/** Stable hook bundle — always call unconditionally from LocationProvider. */
function useLocationController(): LocationController {
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [detectedAddress, setDetectedAddress] = useState<DetectedLocation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef<((result: LocationDetectionResult) => void) | null>(null);

  useEffect(() => {
    let mounted = true;
    let launchTimer: ReturnType<typeof setTimeout> | undefined;

    async function bootstrap() {
      const [savedLabel, savedDetail, promptSeen] = await Promise.all([
        getSavedLocation(),
        getSavedLocationDetail(),
        hasSeenLocationPrompt(),
      ]);

      if (!mounted) return;

      if (savedDetail) {
        setDetectedAddress(savedDetail);
        setLocationState(savedDetail.label || savedDetail.city);
      } else if (savedLabel) {
        setLocationState(savedLabel);
      }

      if (!promptSeen) {
        launchTimer = setTimeout(() => {
          if (mounted) {
            setShowModal(true);
          }
        }, FIRST_LAUNCH_MODAL_DELAY_MS);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
      if (launchTimer) clearTimeout(launchTimer);
    };
  }, []);

  const resolvePending = useCallback((result: LocationDetectionResult) => {
    pendingRef.current?.(result);
    pendingRef.current = null;
  }, []);

  const setLocation = useCallback(async (next: DetectedLocation) => {
    setDetectedAddress(next);
    setLocationState(next.label || next.city);
    await saveLocation(next);
  }, []);

  const requestLocationDetection = useCallback(() => {
    return new Promise<LocationDetectionResult>(resolve => {
      pendingRef.current = resolve;
      setShowModal(true);
    });
  }, []);

  const handleAllow = useCallback(async () => {
    setLoading(true);
    try {
      const address = await detectUserLocation();
      await setLocation(address);
      await markLocationPromptSeen();
      resolvePending({ city: address.city, address, declined: false });
      setShowModal(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Turn on GPS and allow location access, then try again.';
      resolvePending({ city: null, address: null, declined: false, error: message });
      Alert.alert(
        'Could not detect location',
        message,
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: openLocationSettings },
          { text: 'Try again' },
        ],
      );
    } finally {
      setLoading(false);
    }
  }, [resolvePending, setLocation]);

  const handleDecline = useCallback(async () => {
    resolvePending({ city: null, address: null, declined: true });
    await markLocationPromptSeen();
    setShowModal(false);
    setLoading(false);
  }, [resolvePending]);

  return useMemo(
    () => ({
      location,
      detectedAddress,
      setLocation,
      requestLocationDetection,
      showModal,
      loading,
      handleAllow,
      handleDecline,
    }),
    [
      detectedAddress,
      handleAllow,
      handleDecline,
      loading,
      location,
      requestLocationDetection,
      setLocation,
      showModal,
    ],
  );
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const {
    showModal,
    loading,
    handleAllow,
    handleDecline,
    ...contextValue
  } = useLocationController();

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
      <LocationPermissionModal
        visible={showModal}
        loading={loading}
        onAllow={handleAllow}
        onDecline={handleDecline}
      />
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return ctx;
}
