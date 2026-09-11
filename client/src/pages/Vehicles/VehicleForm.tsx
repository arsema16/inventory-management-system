import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    vehicleId: '',
    vin: '',
    plateNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    batteryInfo: '',
    mileage: 0,
    salePrice: 0,
  });

  useEffect(() => {
    if (isEdit) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      const vehicle = response.data.data;
      setFormData({
        name: vehicle.item?.name || '',
        sku: vehicle.item?.sku || '',
        vehicleId: vehicle.vehicleId,
        vin: vehicle.vin || '',
        plateNumber: vehicle.plateNumber || '',
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || new Date().getFullYear(),
        batteryInfo: vehicle.batteryInfo || '',
        mileage: vehicle.mileage || 0,
        salePrice: vehicle.salePrice || 0,
      });
    } catch (error: any) {
      alert('Failed to fetch vehicle details');
      navigate('/vehicles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isEdit) {
        // Update vehicle only
        const vehicleData = {
          vehicleId: formData.vehicleId,
          vin: formData.vin,
          plateNumber: formData.plateNumber,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          batteryInfo: formData.batteryInfo,
          mileage: formData.mileage,
          salePrice: formData.salePrice,
        };
        await api.put(`/vehicles/${id}`, vehicleData);
        alert('Vehicle updated successfully!');
      } else {
        // Create item first
        const itemData = {
          name: formData.name,
          sku: formData.sku,
          type: 'VEHICLE',
          unit: 'unit',
          quantity: 1,
          minimumQty: 0,
        };
        const itemResponse = await api.post('/items', itemData);
        
        // Then create vehicle
        const vehicleData = {
          itemId: itemResponse.data.data.id,
          vehicleId: formData.vehicleId,
          vin: formData.vin,
          plateNumber: formData.plateNumber,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          batteryInfo: formData.batteryInfo,
          mileage: formData.mileage,
          salePrice: formData.salePrice,
        };
        await api.post('/vehicles', vehicleData);
        alert('Vehicle created successfully!');
      }
      
      navigate('/vehicles');
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} vehicle`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'mileage', 'salePrice'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/vehicles')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Vehicles
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <input
              type="text"
              name="sku"
              required
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle ID *
            </label>
            <input
              type="text"
              name="vehicleId"
              required
              value={formData.vehicleId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VIN
            </label>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plate Number
            </label>
            <input
              type="text"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Make *
            </label>
            <input
              type="text"
              name="make"
              required
              value={formData.make}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <input
              type="text"
              name="model"
              required
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Battery Info
            </label>
            <input
              type="text"
              name="batteryInfo"
              value={formData.batteryInfo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mileage
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Price
            </label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
