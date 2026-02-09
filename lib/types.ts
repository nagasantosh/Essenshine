import { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "created"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered";

export type OrderTracking = {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

export type OrderDoc = {
  createdAt: Timestamp;
  currency: "INR" | "USD" | "EUR" | string;
  email: string;
  items: Array<any>;
  status: OrderStatus | string;
  userId: string;

  // new admin-managed fields
  fulfillmentStatus?: OrderStatus;
  tracking?: OrderTracking;
  adminNotes?: string;
};

export type ProductDoc = {
  name: string;
  slug: string;
  description?: string;
  images?: string[];

  prices: {
    INR: number;
    USD: number;
    EUR: number;
  };

  stock: number;
  active: boolean;

  createdAt?: any;
  updatedAt?: any;
};
