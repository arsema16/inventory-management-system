import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Item } from '../../types';
import Table from '../../components/Table';
import Button from '../../components/Button';
import SearchInput from '../../components/SearchInput';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import { formatDate, getStatusColor, formatStatus } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../config/constants';

export default function InventoryList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManage = user?.role === USER_ROLES.STOREKEEPER || user?.role === USER_ROLES.ADMIN;

  useEffect(() => {
    fetchItems();
  }, [debouncedSearch, statusFilter, typeFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await api.get('/items', { params });
      setItems(response.data.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Item) => {
    navigate(`/inventory/edit/${item.id}`);
  };

  const handleRestock = async (item: Item) => {
    const quantityStr = prompt(`Restock ${item.name}\nCurrent quantity: ${item.quantity} ${item.unit}\n\nEnter quantity to add:`);
    if (!quantityStr) return;

    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await api.post(`/items/${item.id}/restock`, { quantity });
      alert(`Successfully restocked ${quantity} ${item.unit} of ${item.name}`);
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to restock item');
    }
  };

  const handleDelete = async (item: Item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/items/${item.id}`);
      alert('Item deleted successfully!');
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      width: '150px',
    },
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Item) => (
        <Badge variant={item.type === 'VEHICLE' ? 'info' : 'default'}>
          {formatStatus(item.type)}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item: Item) => (
        <span className={item.quantity <= item.minimumQty ? 'text-orange-600 font-semibold' : ''}>
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Item) => (
        <Badge variant={getStatusColor(item.status)}>
          {formatStatus(item.status)}
        </Badge>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: Item) => item.location || '-',
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: Item) => formatDate(item.createdAt),
    },
    ...(canManage ? [{
      key: 'actions',
      header: 'Actions',
      render: (item: Item) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleRestock(item)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Restock
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item)}
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        {canManage && (
          <Button onClick={() => navigate('/inventory/new')}>
            Add New Item
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput
            placeholder="Search by name, SKU, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="GENERAL">General</option>
            <option value="VEHICLE">Vehicle</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {items.filter(i => i.status === 'AVAILABLE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">
            {items.filter(i => i.quantity <= i.minimumQty && i.quantity > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {items.filter(i => i.quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={items}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No inventory items found"
        onRowClick={(item) => navigate(`/inventory/${item.id}`)}
      />
    </div>
  );
}
