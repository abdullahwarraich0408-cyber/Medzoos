export type DetectedLocation = {
  street: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  label: string;
  accuracy?: number | null;
};
