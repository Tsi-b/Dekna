import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

export interface Order {
  id: string;
  status: string;
  is_mock: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  addresses: ShippingAddress[];
  orders: Order[];
  wishlistIds: string[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signingIn: boolean;
  signingOut: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
  addAddress: (address: Omit<ShippingAddress, 'id' | 'user_id'>) => Promise<{ error: any }>;
  updateAddress: (id: string, address: Partial<ShippingAddress>) => Promise<{ error: any }>;
  deleteAddress: (id: string) => Promise<{ error: any }>;
  setDefaultAddress: (id: string) => Promise<{ error: any }>;
  addToWishlist: (productId: string) => Promise<{ error: any }>;
  removeFromWishlist: (productId: string) => Promise<{ error: any }>;
  refreshOrders: () => Promise<{ error: any }>;
  refreshAddresses: () => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
