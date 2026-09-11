import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Vehicle, Client } from '../../types';

export default function SaleForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClient, setShowNewClient] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    clientId: '',
    salePrice: 0,
    paymentReference: '',
    notes: '',
  });
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
  });

  useEffect(() => {
    fetchVehicles();
    fetchClients();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles?status=AVAILABLE');
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleCreateClient = async () => {
    try {
      const response = await api.post('/clients', newClient);
      setClients([...clients, response.data.data]);
      setFormData(prev => ({ ...prev, clientId: response.data.data.id }));
      setShowNewClient(false);
      alert('Client created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create client');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/sales', formData);
      alert('Sale created successfully!');
      navigate('/sales');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/sales')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Sales
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Vehicle Sale</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle *
              </label>
              <select
                required
                value={formData.vehicleId}
                onChange={(e) => {
                  const vehicle = vehicles.find(v => v.id === e.target.value);
                  setFormData(prev => ({ 
                    ...prev, 
                    vehicleId: e.target.value,
                    salePrice: vehicle?.salePrice || 0
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} {v.year} - {v.vehicleId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <div className="flex gap-2">
                <select
                  required={!showNewClient}
                  value={formData.clientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={showNewClient}
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} - {c.phone || c.email}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewClient(!showNewClient)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  {showNewClient ? 'Select Existing' : '+ New Client'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (ETB) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">ETB</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) }))}
                  className="w-full pl-14 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference
              </label>
              <input
                type="text"
                value={formData.paymentReference}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
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
              {loading ? 'Creating...' : 'Create Sale'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/sales')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>

        {showNewClient && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Client</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name *"
                value={newClient.firstName}
                onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Last Name *"
                value={newClient.lastName}
                onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone * e.g. 0911234567 or +251911234567"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="ID Number"
                value={newClient.idNumber}
                onChange={(e) => setNewClient(prev => ({ ...prev, idNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Address"
                value={newClient.address}
                onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleCreateClient}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Client
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
