import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Vehicle } from '../../types';
import Table from '../../components/Table';
import Button from '../../components/Button';
import SearchInput from '../../components/SearchInput';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import { formatCurrency, getStatusColor, formatStatus } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../config/constants';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManage = [USER_ROLES.FINANCE, USER_ROLES.STOREKEEPER, USER_ROLES.ADMIN].includes(user?.role as any);

  useEffect(() => {
    fetchVehicles();
  }, [debouncedSearch, statusFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/vehicles', { params });
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    navigate(`/vehicles/edit/${vehicle.id}`);
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`Are you sure you want to delete this vehicle?`)) {
      return;
    }
    
    try {
      await api.delete(`/vehicles/${vehicle.id}`);
      alert('Vehicle deleted successfully!');
      fetchVehicles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const columns = [
    {
      key: 'vehicleId',
      header: 'Vehicle ID',
      width: '120px',
    },
    {
      key: 'make',
      header: 'Make & Model',
      render: (vehicle: Vehicle) => (
        <div>
          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
          {vehicle.year && <p className="text-sm text-gray-500">{vehicle.year}</p>}
        </div>
      ),
    },
    {
      key: 'vin',
      header: 'VIN',
      render: (vehicle: Vehicle) => vehicle.vin || '-',
    },
    {
      key: 'plateNumber',
      header: 'Plate',
      render: (vehicle: Vehicle) => vehicle.plateNumber || '-',
    },
    {
      key: 'mileage',
      header: 'Mileage',
      render: (vehicle: Vehicle) => vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '-',
    },
    {
      key: 'salePrice',
      header: 'Price',
      render: (vehicle: Vehicle) => vehicle.salePrice ? formatCurrency(Number(vehicle.salePrice)) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (vehicle: Vehicle) => (
        <Badge variant={getStatusColor(vehicle.status)}>
          {formatStatus(vehicle.status)}
        </Badge>
      ),
    },
    ...(canManage ? [{
      key: 'actions',
      header: 'Actions',
      render: (vehicle: Vehicle) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(vehicle)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(vehicle)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage vehicle inventory</p>
        </div>
        {canManage && (
          <Button onClick={() => navigate('/vehicles/new')}>
            Add New Vehicle
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchInput
            placeholder="Search by ID, VIN, plate, make, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {vehicles.filter(v => v.status === 'AVAILABLE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Reserved</p>
          <p className="text-2xl font-bold text-blue-600">
            {vehicles.filter(v => v.status === 'RESERVED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Sold</p>
          <p className="text-2xl font-bold text-gray-600">
            {vehicles.filter(v => v.status === 'SOLD').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={vehicles}
        keyExtractor={(vehicle) => vehicle.id}
        loading={loading}
        emptyMessage="No vehicles found"
        onRowClick={(vehicle) => navigate(`/vehicles/${vehicle.id}`)}
      />
    </div>
  );
}
