export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
  };
}

export interface Department {
  id: string;
  name: string;
  createdAt: string;
  _count?: {
    users: number;
  };
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  description?: string;
  type: string;
  unit: string;
  quantity: number;
  minimumQty: number;
  status: string;
  location?: string;
  createdAt: string;
  vehicle?: Vehicle;
}

export interface Vehicle {
  id: string;
  itemId: string;
  vehicleId: string;
  vin?: string;
  plateNumber?: string;
  make: string;
  model: string;
  year?: number;
  batteryInfo?: string;
  mileage?: number;
  status: string;
  salePrice?: number;
  item?: Item;
}

export interface Request {
  id: string;
  requestNumber: string;
  type: string;
  status: string;
  reason?: string;
  rejectionReason?: string;
  requestedById: string;
  approvedAt?: string;
  fulfilledAt?: string;
  createdAt: string;
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: { name: string };
  };
  items: RequestItem[];
  approvals?: Approval[];
}

export interface RequestItem {
  id: string;
  itemId: string;
  quantity: number;
  approvedQty?: number;
  issuedQty: number;
  notes?: string;
  item: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  idNumber?: string;
}

export interface VehicleSale {
  id: string;
  saleNumber: string;
  vehicleId: string;
  clientId: string;
  submittedById: string;
  salePrice: number;
  paymentReference?: string;
  status: string;
  notes?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt: string;
  vehicle: Vehicle & { item: { name: string } };
  client: Client;
  submittedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  documents?: Document[];
  approvals?: Approval[];
}

export interface Document {
  id: string;
  saleId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedById: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  requestId?: string;
  saleId?: string;
  approvedById: string;
  status: string;
  comments?: string;
  rejectionReason?: string;
  createdAt: string;
  approvedBy: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
