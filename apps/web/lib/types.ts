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

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UpdateUserPayload = {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  roleCode?: string;
  status?: UserStatus;
  password?: string;
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
  description?: string | null;
  imageUrl?: string | null;
  agentPrice?: string | null;
  specialDiscount?: boolean;
  quantity?: number;
  soldQty?: number;
  remainingQty?: number;
  expiryDate?: string | null;
  stockCreateDate?: string | null;
};

export type CreateProductPayload = {
  name: string;
  sku?: string;
  unitType?: string;
  unitVolume?: string;
  price?: string;
  status?: boolean;
  description?: string;
  imageUrl?: string;
  agentPrice?: string;
  specialDiscount?: boolean;
  quantity?: number;
  soldQty?: number;
  remainingQty?: number;
  expiryDate?: string;
  stockCreateDate?: string;
};

export type UpdateProductPayload = {
  name?: string;
  sku?: string;
  unitType?: string;
  unitVolume?: string;
  price?: string;
  status?: boolean;
  description?: string;
  imageUrl?: string;
  agentPrice?: string;
  specialDiscount?: boolean;
  quantity?: number;
  soldQty?: number;
  remainingQty?: number;
  expiryDate?: string;
  stockCreateDate?: string;
};

export type StockBatch = {
  id: string;
  stockNumber?: number | null;
  productId: string;
  unitType: string;
  price: string;
  agentPrice?: string | null;
  retailPrice?: string | null;
  specialDiscount: boolean;
  quantity: number;
  soldQty: number;
  remainingQty: number;
  stockCreateDate: string;
  expiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product;
};

export type CreateStockBatchPayload = {
  productId: string;
  unitType: string;
  price: string;
  agentPrice?: string;
  retailPrice?: string;
  specialDiscount?: boolean;
  quantity?: number;
  soldQty?: number;
  remainingQty?: number;
  stockCreateDate?: string;
  expiryDate?: string;
};

export type UpdateStockBatchPayload = {
  unitType?: string;
  price?: string;
  agentPrice?: string;
  retailPrice?: string;
  specialDiscount?: boolean;
  quantity?: number;
  soldQty?: number;
  remainingQty?: number;
  stockCreateDate?: string;
  expiryDate?: string;
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
  regionId: string;
  cityId: string;
  townId?: string | null;
  notifySms: boolean;
  notifyEmail: boolean;
  status: ShopStatus;
  createdAt: string;
  region: Region;
  city: City;
  town?: Town | null;
  assignedAgent?: { id: string; user: { fullName: string } } | null;
  assignedDriver?: { id: string; user: { fullName: string } } | null;
  legalBusinessName?: string | null;
  businessType?: string | null;
  registrationNo?: string | null;
  taxId?: string | null;
  certificateOfRegistrationUrl?: string | null;
  ownerIdFrontUrl?: string | null;
  ownerIdBackUrl?: string | null;
  shopFrontPhotoUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  whatsappNumber?: string | null;
  nationalId?: string | null;
  ownerPhone?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  branch?: string | null;
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
  cityAssignments?: { id: string; city: City }[];
  townAssignments?: { id: string; town: Town & { city: City } }[];
  ordersAssigned?: number;
  currentSales?: string;
  currentSalesQty?: number;
  registeredClientsCount?: number;
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
  stockBatchId: string;
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
  placedByUser?: User;
  lastActionByUser?: User | null;
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
    stockBatch?: StockBatch | null;
  }[];
};

export type CreateOrderPayload = {
  shopId: string;
  placedByUserId: string;
  agentId?: string;
  driverId?: string;
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
  townId?: string;
  notifySms?: boolean;
  notifyEmail?: boolean;
  legalBusinessName?: string;
  businessType?: string;
  registrationNo?: string;
  taxId?: string;
  certificateOfRegistrationUrl?: string;
  ownerIdFrontUrl?: string;
  ownerIdBackUrl?: string;
  shopFrontPhotoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  whatsappNumber?: string;
  nationalId?: string;
  ownerPhone?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  branch?: string;
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
  townId?: string;
  notifySms?: boolean;
  notifyEmail?: boolean;
  status?: ShopStatus;
  legalBusinessName?: string;
  businessType?: string;
  registrationNo?: string;
  taxId?: string;
  certificateOfRegistrationUrl?: string;
  ownerIdFrontUrl?: string;
  ownerIdBackUrl?: string;
  shopFrontPhotoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  whatsappNumber?: string;
  nationalId?: string;
  ownerPhone?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  branch?: string;
};