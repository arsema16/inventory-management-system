import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { VehicleSale } from '../../types';
import { formatCurrency, formatEthiopianPhone } from '../../utils/formatters';

export default function SaleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sale, setSale] = useState<VehicleSale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSale();
  }, [id]);

  const fetchSale = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sales/${id}`);
      setSale(response.data.data);
    } catch (error) {
      console.error('Error fetching sale:', error);
      alert('Failed to fetch sale details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const comments = prompt('Enter approval comments (optional):');
    
    try {
      await api.post(`/sales/${id}/approve`, { comments });
      alert('Sale approved successfully!');
      fetchSale();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve sale');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.post(`/sales/${id}/reject`, { reason });
      alert('Sale rejected successfully!');
      fetchSale();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject sale');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Mark this sale as completed?')) return;

    try {
      await api.post(`/sales/${id}/complete`);
      alert('Sale completed successfully!');
      fetchSale();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete sale');
    }
  };

  const handleUploadDocument = () => {
    alert('Document upload feature coming soon!');
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!sale) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Sale not found</p>
        <button 
          onClick={() => navigate('/sales')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Sales
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sale Details</h1>
            <p className="text-gray-600 mt-1">{sale.saleNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)}`}>
            {sale.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sale Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sale Number</p>
                <p className="font-medium">{sale.saleNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{sale.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sale Price</p>
                <p className="font-medium text-green-600">{formatCurrency(Number(sale.salePrice))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="font-medium">{new Date(sale.createdAt).toLocaleDateString()}</p>
              </div>
              {sale.paymentReference && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Payment Reference</p>
                  <p className="font-medium">{sale.paymentReference}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Submitted By</p>
                <p className="font-medium">
                  {sale.submittedBy.firstName} {sale.submittedBy.lastName}
                </p>
              </div>
              {sale.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="font-medium">{sale.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-medium">{sale.vehicle.item.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle ID</p>
                <p className="font-medium">{sale.vehicle.vehicleId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Make & Model</p>
                <p className="font-medium">{sale.vehicle.make} {sale.vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year</p>
                <p className="font-medium">{sale.vehicle.year}</p>
              </div>
              {sale.vehicle.vin && (
                <div>
                  <p className="text-sm text-gray-600">VIN</p>
                  <p className="font-medium">{sale.vehicle.vin}</p>
                </div>
              )}
              {sale.vehicle.plateNumber && (
                <div>
                  <p className="text-sm text-gray-600">Plate Number</p>
                  <p className="font-medium">{sale.vehicle.plateNumber}</p>
                </div>
              )}
              {sale.vehicle.mileage && (
                <div>
                  <p className="text-sm text-gray-600">Mileage</p>
                  <p className="font-medium">{sale.vehicle.mileage.toLocaleString()} km</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {sale.client.firstName} {sale.client.lastName}
                </p>
              </div>
              {sale.client.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{formatEthiopianPhone(sale.client.phone)}</p>
                </div>
              )}
              {sale.client.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{sale.client.email}</p>
                </div>
              )}
              {sale.client.idNumber && (
                <div>
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="font-medium">{sale.client.idNumber}</p>
                </div>
              )}
              {sale.client.address && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{sale.client.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Approvals */}
          {sale.approvals && sale.approvals.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h2>
              <div className="space-y-3">
                {sale.approvals.map((approval) => (
                  <div key={approval.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {approval.approvedBy.firstName} {approval.approvedBy.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{approval.approvedBy.role}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(approval.status)}`}>
                        {approval.status}
                      </span>
                    </div>
                    {approval.comments && (
                      <p className="text-sm text-gray-600 mt-2">{approval.comments}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(approval.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {sale.documents && sale.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {sale.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-gray-600">{doc.type}</p>
                    </div>
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {sale.status === 'PENDING' && (
                <>
                  <button 
                    onClick={handleApprove}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={handleReject}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
              {sale.status === 'APPROVED' && (
                <button 
                  onClick={handleComplete}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mark as Completed
                </button>
              )}
              <button 
                onClick={handleUploadDocument}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Upload Document
              </button>
              <button 
                onClick={() => navigate('/sales')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Sale Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Vehicle Price:</span>
                <span className="font-medium text-blue-900">{formatCurrency(Number(sale.salePrice))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="text-blue-700 font-semibold">Total:</span>
                <span className="font-bold text-blue-900">{formatCurrency(Number(sale.salePrice))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
