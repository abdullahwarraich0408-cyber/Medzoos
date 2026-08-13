import { getApiBaseUrl } from '../../config/api';
import { getAccessToken } from '../auth/tokenStorage';
import { ApiError } from '../api/client';
import type { PickedPrescription } from '../familyVault/uploadPrescription';
import type { RawPrescriptionOrder } from '../mappers/prescriptionOrder';

export type PrescriptionMedicineItem = {
  name: string;
  quantity?: number;
  unit_price?: number;
};

export type SubmitPrescriptionOrderInput = {
  file: PickedPrescription;
  delivery_address: {
    street: string;
    city: string;
    province?: string;
  };
  delivery_type: 'express' | 'standard';
  medicines?: PrescriptionMedicineItem[];
};

export async function submitPrescriptionOrder(
  input: SubmitPrescriptionOrderInput,
): Promise<{ order: RawPrescriptionOrder }> {
  const token = await getAccessToken();
  if (!token) {
    throw new ApiError('Sign in required to upload prescriptions', 401, null);
  }

  const formData = new FormData();
  formData.append('prescriptionFile', {
    uri: input.file.uri,
    name: input.file.name,
    type: input.file.type,
  } as unknown as Blob);
  formData.append('delivery_address', JSON.stringify(input.delivery_address));
  formData.append('delivery_type', input.delivery_type);
  if (input.medicines?.length) {
    formData.append('medicines', JSON.stringify(input.medicines));
  }

  const response = await fetch(`${getApiBaseUrl()}/prescription-orders`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (payload as { message?: string })?.message ||
      `Upload failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  const order =
    (payload as { data?: { order?: RawPrescriptionOrder } })?.data?.order ||
    (payload as { order?: RawPrescriptionOrder })?.order;

  if (!order?.id) {
    throw new ApiError('Prescription submitted but no order returned', 500, payload);
  }

  return { order };
}
