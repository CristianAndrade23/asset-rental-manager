export type AssetStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RETIRED';

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: 'Available',
  RENTED: 'Rented',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired',
};

export interface Asset {
  id: number;
  code: string;
  name: string;
  category: string;
  serialNumber: string | null;
  dailyRate: number;
  status: AssetStatus;
  acquisitionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetPayload {
  code: string;
  name: string;
  category: string;
  serialNumber: string | null;
  dailyRate: number;
  acquisitionDate: string | null;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AssetQuery {
  status: AssetStatus | null;
  search: string;
  page: number;
}
