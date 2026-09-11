import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { Item } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../config/constants';

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  previousQty: number;
  newQty: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function InventoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const canManage = user?.role === USER_ROLES.STOREKEEPER || user?.role === USER_ROLES.ADMIN;

  useEffect(() => {
    fetchItem();
    fetchMovements();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/items/${id}`);
      setItem(response.data.data);
    } catch (error) {
      console.error('Error fetching item:', error);
      alert('Failed to fetch item details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await api.get(`/items/${id}/movements`);
      setMovements(response.data.data);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const handleRestock = async () => {
    if (!item) return;

    const quantityStr = prompt(
      `Restock ${item.name}\nCurrent quantity: ${item.quantity} ${item.unit}\n\nEnter quantity to add:`
    );
    if (!quantityStr) return;

    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await api.post(`/items/${item.id}/restock`, { quantity });
      alert(`Successfully restocked ${quantity} ${item.unit} of ${item.name}`);
      fetchItem();
      fetchMovements();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to restock item');
    }
  };

  const handleEdit = () => {
    navigate(`/inventory/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/items/${id}`);
      alert('Item deleted successfully!');
      navigate('/inventory');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete item');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Item not found</p>
        <button 
          onClick={() => navigate('/inventory')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Inventory
        </button>
      </div>
    );
  }

  const isOutOfStock = item.quantity === 0;
  const isLowStock = item.quantity > 0 && item.quantity <= item.minimumQty;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800',
      LOW_STOCK: 'bg-orange-100 text-orange-800',
      OUT_OF_STOCK: 'bg-red-100 text-red-800',
      RESERVED: 'bg-blue-100 text-blue-800',
      SOLD: 'bg-gray-100 text-gray-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/inventory')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Inventory
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600 mt-1">SKU: {item.sku}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
            {item.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Alert for out of stock or low stock */}
      {isOutOfStock && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Out of Stock</h3>
              <p className="text-red-700 text-sm">This item is currently out of stock. Please restock immediately.</p>
            </div>
            {canManage && (
              <button
                onClick={handleRestock}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Restock Now
              </button>
            )}
          </div>
        </div>
      )}

      {isLowStock && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Low Stock Warning</h3>
              <p className="text-orange-700 text-sm">
                Current stock ({item.quantity} {item.unit}) is below minimum level ({item.minimumQty} {item.unit})
              </p>
            </div>
            {canManage && (
              <button
                onClick={handleRestock}
                className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Restock
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{item.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-medium">{item.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{item.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unit</p>
                <p className="font-medium">{item.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Quantity</p>
                <p className={`font-medium text-lg ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Minimum Quantity</p>
                <p className="font-medium">{item.minimumQty} {item.unit}</p>
              </div>
              {item.location && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{item.location}</p>
                </div>
              )}
              {item.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{item.description}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Details if applicable */}
          {item.vehicle && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle ID</p>
                  <p className="font-medium">{item.vehicle.vehicleId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Make & Model</p>
                  <p className="font-medium">{item.vehicle.make} {item.vehicle.model}</p>
                </div>
                {item.vehicle.year && (
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-medium">{item.vehicle.year}</p>
                  </div>
                )}
                {item.vehicle.vin && (
                  <div>
                    <p className="text-sm text-gray-600">VIN</p>
                    <p className="font-medium">{item.vehicle.vin}</p>
                  </div>
                )}
                {item.vehicle.plateNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Plate Number</p>
                    <p className="font-medium">{item.vehicle.plateNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Stock:</span>
                <span className="font-medium">{item.quantity} {item.unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Min Level:</span>
                <span className="font-medium">{item.minimumQty} {item.unit}</span>
              </div>
            </div>
          </div>

          {canManage && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleRestock}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Restock
                </button>
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button 
                  onClick={() => navigate('/inventory')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Back to List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Movement History */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Stock Movement History</h2>
            <p className="text-sm text-gray-600 mt-1">Track all restocks and item movements</p>
          </div>
          <div className="overflow-x-auto">
            {movements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No movement history available
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference/Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(movement.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            movement.type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : movement.type === 'OUT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {movement.type === 'IN' ? '↑ IN' : movement.type === 'OUT' ? '↓ OUT' : movement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`font-medium ${
                            movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {movement.type === 'IN' ? '+' : '-'}
                          {movement.quantity} {item?.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {movement.previousQty} {item?.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.newQty} {item?.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {movement.user.firstName} {movement.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{movement.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {movement.reference && (
                          <div className="font-medium text-blue-600">{movement.reference}</div>
                        )}
                        {movement.notes && <div className="text-xs">{movement.notes}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
