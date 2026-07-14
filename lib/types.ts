export type Menu = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
};

export type OrderStatus = "pending" | "done" | "cancelled";
export type FulfillmentType = "pickup" | "delivery";

export type OrderItem = {
  id: string;
  order_id: string;
  menu_id: string | null;
  menu_name_snapshot: string;
  unit_price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: FulfillmentType;
  preferred_at: string;
  delivery_address: string | null;
  want_point_earn: boolean;
  want_cash_receipt: boolean;
  cash_receipt_phone: string | null;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
};

export type CartItem = {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};
