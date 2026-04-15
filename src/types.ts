/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ItemCondition {
  VERY_GOOD = "Very Good Condition",
  GOOD = "Good Condition",
  NEEDS_REPAIR = "Need to be repaired",
  UNUSABLE = "No longer usable"
}

export enum LogStatus {
  BORROWED = "Borrowed",
  RETURNED = "Returned",
  CONSUMED = "Consumed",
  LOST = "Lost",
  DAMAGED = "Damaged"
}

export interface RescueEquipment {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  source: string;
  condition: ItemCondition;
  location: string;
  lastInspectionDate: string;
  remarks: string;
}

export interface Medicine {
  id: string;
  genericName: string;
  brandName?: string;
  dosage: string;
  form: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  storage: string;
  lotNumber: string;
  lastStockCount: number;
  remarks: string;
}

export interface FirstAidKit {
  id: string;
  name: string;
  location: string;
  responsiblePerson: string;
  condition: string;
  lastCheckedDate: string;
  contents: { itemName: string; qty: number; expiry?: string }[];
}

export interface BorrowersLog {
  id: string;
  dateBorrowed: string;
  items: { itemId: string; name: string; quantity: number }[];
  purpose: string;
  borrowerName: string;
  borrowerContact: string;
  releasingOfficer: string;
  dateReturned?: string;
  status: LogStatus;
  conditionOnReturn?: string;
  quantityReturned?: number;
  remarks: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  date: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string; // e.g., "Donation", "Procurement", "Used in Flood Response"
  reference?: string; // e.g., "PO #123", "Log ID #456"
}
