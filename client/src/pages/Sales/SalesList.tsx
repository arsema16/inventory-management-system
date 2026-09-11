import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { VehicleSale } from '../../types';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import { formatCurrency, formatDateTime, formatEthiopianPhone, getStatusColor, formatStatus } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../config/constants';

export default function SalesList() {
  const [sales, setSales] = useState<VehicleSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const canCreate = [USER_ROLES.FINANCE, USER_ROLES.ADMIN].includes(user?.role as any);

  useEffect(() => {
    fetchSales();
  }, [statusFilter]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/sales', { params });
      setSales(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (sale: VehicleSale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handleDelete = async (sale: VehicleSale) => {
    if (!window.confirm(`Are you sure you want to delete sale ${sale.saleNumber}?`)) {
      return;
    }
    
    try {
      await api.delete(`/sales/${sale.id}`);
      alert('Sale deleted successfully!');
      fetchSales();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete sale');
    }
  };

  const columns = [
    {
      key: 'saleNumber',
      header: 'Sale #',
      width: '120px',
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (sale: VehicleSale) => (
        <div>
          <p className="font-medium">{sale.vehicle.item.name}</p>
          <p className="text-sm text-gray-500">{sale.vehicle.vehicleId}</p>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (sale: VehicleSale) => (
        <div>
          <p className="font-medium">
            {sale.client.firstName} {sale.client.lastName}
          </p>
          {sale.client.phone && <p className="text-sm text-gray-500">{formatEthiopianPhone(sale.client.phone)}</p>}
        </div>
      ),
    },
    {
      key: 'salePrice',
      header: 'Price',
      render: (sale: VehicleSale) => formatCurrency(Number(sale.salePrice)),
    },
    {
      key: 'submittedBy',
      header: 'Submitted By',
      render: (sale: VehicleSale) => 
        `${sale.submittedBy.firstName} ${sale.submittedBy.lastName}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (sale: VehicleSale) => (
        <Badge variant={getStatusColor(sale.status)}>
          {formatStatus(sale.status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (sale: VehicleSale) => formatDateTime(sale.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (sale: VehicleSale) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(sale)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View
          </button>
          {sale.status === 'PENDING' && canCreate && (
            <button
              onClick={() => handleDelete(sale)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Sales</h1>
          <p className="text-gray-600 mt-1">Manage vehicle sales and documents</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/sales/new')}>
            New Sale
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {sales.filter(s => s.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {sales.filter(s => s.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(
              sales
                .filter(s => s.status === 'COMPLETED')
                .reduce((sum, s) => sum + Number(s.salePrice), 0)
            )}
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={sales}
        keyExtractor={(sale) => sale.id}
        loading={loading}
        emptyMessage="No vehicle sales found"
        onRowClick={(sale) => navigate(`/sales/${sale.id}`)}
      />
    </div>
  );
}
