export type Role = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  role: Role;
};

export type CreateUserPayload = {
  fullName: string;
  email: string;
  phone?: string;
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