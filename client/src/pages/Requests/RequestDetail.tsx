import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import { Request } from '../../types';

export default function RequestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/requests/${id}`);
      setRequest(response.data.data);
    } catch (error) {
      console.error('Error fetching request:', error);
      alert('Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/requests/${id}/approve`);
      alert('Request approved successfully!');
      fetchRequest();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.post(`/requests/${id}/reject`, { reason });
      alert('Request rejected successfully!');
      fetchRequest();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleFulfill = async () => {
    try {
      await api.post(`/requests/${id}/fulfill`);
      alert('Request fulfilled successfully!');
      fetchRequest();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fulfill request');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Request not found</p>
        <button 
          onClick={() => navigate('/requests')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Requests
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      PARTIALLY_APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      FULFILLED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/requests')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Requests
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
            <p className="text-gray-600 mt-1">{request.requestNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Request Number</p>
                <p className="font-medium">{request.requestNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{request.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{request.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Requested By</p>
                <p className="font-medium">
                  {request.requestedBy.firstName} {request.requestedBy.lastName}
                  {request.requestedBy.department && ` - ${request.requestedBy.department.name}`}
                </p>
              </div>
              {request.reason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="font-medium">{request.reason}</p>
                </div>
              )}
              {request.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Rejection Reason</p>
                  <p className="font-medium text-red-600">{request.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {request.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.quantity} {item.item.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.approvedQty || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.issuedQty || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approvals */}
          {request.approvals && request.approvals.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h2>
              <div className="space-y-3">
                {request.approvals.map((approval) => (
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {request.status === 'PENDING' && (
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
              {request.status === 'APPROVED' && (
                <button 
                  onClick={handleFulfill}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Fulfill
                </button>
              )}
              <button 
                onClick={() => navigate('/requests')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
