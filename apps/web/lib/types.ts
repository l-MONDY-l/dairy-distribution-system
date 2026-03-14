export type Role = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
};

export type Permission = {
  id: string;
  name: string;
  code: string;
  module: string;
};

export type User = {
  id: string;
  fullName: string;
  username?: string | null;
  email: string;
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  role: Role;
};

export type CreateUserPayload = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  roleCode: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  unitType: string;
  unitVolume?: string | null;
  price: string;
  status: boolean;
  createdAt: string;
};

export type CreateProductPayload = {
  name: string;
  sku: string;
  unitType: string;
  unitVolume?: string;
  price: string;
  status?: boolean;
};

export type UpdateProductPayload = {
  name?: string;
  sku?: string;
  unitType?: string;
  unitVolume?: string;
  price?: string;
  status?: boolean;
};

export type Region = {
  id: string;
  name: string;
  code: string;
  status: boolean;
};

export type District = {
  id: string;
  name: string;
  code: string;
  status: boolean;
  regionId: string;
  region?: Region;
};

export type City = {
  id: string;
  name: string;
  status: boolean;
  regionId: string;
  districtId?: string | null;
  region?: Region;
  district?: District | null;
};

export type Town = {
  id: string;
  name: string;
  code: string;
  status: boolean;
  cityId: string;
  city?: City;
};

export type CityAssignment = {
  id: string;
  cityId: string;
  agentId: string;
  driverId: string;
  createdAt: string;
  updatedAt: string;
};

export type ShopStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';

export type Shop = {
  id: string;
  code: string;
  shopName: string;
  ownerName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  notifySms: boolean;
  notifyEmail: boolean;
  status: ShopStatus;
  createdAt: string;
  region: Region;
  city: City;
};

export type AgentProfile = {
  id: string;
  monthlyTarget: string;
  notificationSms: boolean;
  notificationEmail: boolean;
  status: boolean;
  createdAt: string;
  user: User;
  region: Region;
};

export type CreateAgentPayload = {
  userId: string;
  regionId: string;
  monthlyTarget?: string;
  notificationSms?: boolean;
  notificationEmail?: boolean;
  status?: boolean;
};

export type UpdateAgentPayload = {
  regionId?: string;
  monthlyTarget?: string;
  notificationSms?: boolean;
  notificationEmail?: boolean;
  status?: boolean;
};

export type DriverProfile = {
  id: string;
  vehicleNumber?: string | null;
  licenseNumber?: string | null;
  fuelQuotaDaily: string;
  notificationSms: boolean;
  notificationEmail: boolean;
  status: boolean;
  createdAt: string;
  user: User;
  region: Region;
};

export type CreateDriverPayload = {
  userId: string;
  regionId: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  fuelQuotaDaily?: string;
  notificationSms?: boolean;
  notificationEmail?: boolean;
  status?: boolean;
};

export type UpdateDriverPayload = {
  regionId?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  fuelQuotaDaily?: string;
  notificationSms?: boolean;
  notificationEmail?: boolean;
  status?: boolean;
};

export type OrderItemInput = {
  productId: string;
  qty: number;
};

export type Order = {
  id: string;
  orderNo: string;
  shopId: string;
  regionId: string;
  cityId: string;
  paymentType: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  orderStatus:
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'ASSIGNED'
    | 'DISPATCHED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REJECTED';
  subtotal: string;
  grandTotal: string;
  notes?: string | null;
  orderedAt: string;
  shop: Shop;
  region: Region;
  city: City;
  agent?: AgentProfile | null;
  driver?: DriverProfile | null;
  dispatchStatus:
    | 'PENDING'
    | 'ASSIGNED'
    | 'DISPATCHED'
    | 'DELIVERED'
    | 'FAILED';
  deliveryStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  items: {
    id: string;
    qty: number;
    unitPrice: string;
    lineTotal: string;
    product: Product;
  }[];
};

export type CreateOrderPayload = {
  shopId: string;
  placedByUserId: string;
  agentId?: string;
  paymentType: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  notes?: string;
  items: OrderItemInput[];
};

export type ReturnStatusType = 'PENDING' | 'HOLD' | 'APPROVED' | 'REJECTED';

export type ReturnItem = {
  id: string;
  product: Product;
  goodQty: number;
  brokenQty: number;
  missingQty: number;
};

export type ReturnRecord = {
  id: string;
  returnNo: string;
  status: ReturnStatusType;
  requestedAt: string;
  approvedAt?: string | null;
  notes?: string | null;
  shop: Shop;
  agent?: AgentProfile | null;
  driver?: DriverProfile | null;
  items: ReturnItem[];
};

export type CreateReturnItemInput = {
  productId: string;
  goodQty: number;
  brokenQty: number;
  missingQty: number;
};

export type CreateReturnPayload = {
  shopId: string;
  agentId?: string;
  driverId?: string;
  notes?: string;
  items: CreateReturnItemInput[];
};

export type Payment = {
  id: string;
  invoiceId: string;
  shopId: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  amount: string;
  referenceNo?: string | null;
  paidAt: string;
  notes?: string | null;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  orderId: string;
  shopId: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  total: string;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED';
  issuedAt: string;
  dueDate?: string | null;
  shop: Shop;
  order: Order;
  payments: Payment[];
  paidAmount: number;
  outstanding: number;
};

export type CreatePaymentPayload = {
  invoiceId: string;
  shopId: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  amount: number;
  referenceNo?: string;
  notes?: string;
};


export type CreateShopPayload = {
  code: string;
  shopName: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  regionId: string;
  cityId: string;
  notifySms?: boolean;
  notifyEmail?: boolean;
};

export type UpdateShopPayload = {
  code?: string;
  shopName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  regionId?: string;
  cityId?: string;
  notifySms?: boolean;
  notifyEmail?: boolean;
  status?: ShopStatus;
};