import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

export default function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchDepartment();
    }
  }, [id]);

  const fetchDepartment = async () => {
    try {
      const response = await api.get(`/departments/${id}`);
      const dept = response.data.data;
      setFormData({ name: dept.name });
    } catch (error: any) {
      alert('Failed to fetch department details');
      navigate('/departments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/departments/${id}`, formData);
        alert('Department updated successfully!');
      } else {
        await api.post('/departments', formData);
        alert('Department created successfully!');
      }
      navigate('/departments');
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} department`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/departments')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Departments
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Department' : 'Add New Department'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Department' : 'Create Department')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
