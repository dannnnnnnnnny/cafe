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

/** draft = 합배송 모집 중 등록(어드민 미접수), pending = 접수됨 */
export type OrderStatus = "draft" | "pending" | "done" | "cancelled";
export type FulfillmentType = "pickup" | "delivery";
/** open = 메뉴 모집, submitted = 어드민 전송 완료 */
export type GroupStatus = "open" | "closed" | "submitted" | "done" | "cancelled";

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
  delivery_group_id: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type DeliveryGroup = {
  id: string;
  code: string;
  company_name: string;
  delivery_address: string;
  preferred_at: string;
  host_name: string;
  host_phone: string | null;
  status: GroupStatus;
  created_at: string;
  orders?: Order[];
};

export type CartItem = {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};
