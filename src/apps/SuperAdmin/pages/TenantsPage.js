// src/apps/SuperAdmin/pages/TenantsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Plus, Edit, Trash2,
  Eye, Ban, CheckCircle, Crown, RefreshCw 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import TenantModal from '../components/TenantModal';
import TenantDetailsModal from '../components/TenantDetailsModal';

const API_URL =  'http://localhost:5000';

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [viewingTenant, setViewingTenant] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get(`${API_URL}/api/super-admin/tenants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTenants(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedTenant(null);
    setShowModal(true);
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const handleView = (tenant) => {
    setViewingTenant(tenant);
  };

  const handleDelete = async (tenantId, tenantName) => {
  // First confirmation
  if (!window.confirm(`Are you sure you want to DELETE "${tenantName}"? This action cannot be undone!`)) return;
  
  // Prompt for deletion reason
  const reason = window.prompt(
    'Please provide a reason for deleting this tenant:',
    'Administrative decision'
  );
  
  // User cancelled or provided empty reason
  if (!reason || reason.trim() === '') {
    toast.error('Deletion cancelled - reason is required');
    return;
  }
  
  try {
    const token = localStorage.getItem('superAdminToken');
    await axios.delete(
      `${API_URL}/api/super-admin/tenants/${tenantId}`,
      { 
        headers: { Authorization: `Bearer ${token}` },
        data: { reason: reason.trim() } // ADD THIS
      }
    );
    toast.success('Tenant deleted successfully');
    fetchTenants();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete tenant');
  }
};

 const handleSuspend = async (tenantId, tenantName) => {
  // Prompt for suspension reason
  const reason = window.prompt(
    `Suspend "${tenantName}"?\n\nUsers will not be able to access their account. Please provide a reason:`,
    'Policy violation'
  );
  
  // User cancelled or provided empty reason
  if (!reason || reason.trim() === '') {
    toast.error('Suspension cancelled - reason is required');
    return;
  }
  
  try {
    const token = localStorage.getItem('superAdminToken');
    await axios.put(
      `${API_URL}/api/super-admin/tenants/${tenantId}/suspend`,
      { reason: reason.trim() }, // ADD the reason in request body
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success('Tenant suspended successfully');
    fetchTenants();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to suspend tenant');
  }
};

  const handleReactivate = async (tenantId) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      await axios.put(
        `${API_URL}/api/super-admin/tenants/${tenantId}/reactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Tenant reactivated');
      fetchTenants();
    } catch (error) {
      toast.error('Failed to reactivate tenant');
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanColor = (plan) => {
    const colors = {
      free: 'gray',
      basic: 'blue',
      premium: 'purple',
      enterprise: 'yellow'
    };
    return colors[plan] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tenant Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all organizations on the platform ({tenants.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchTenants}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Tenant</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search tenants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Tenants Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No tenants found
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
                          <p className="text-sm text-gray-500">{tenant.slug}.i-expense.ikftech.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPlanColor(tenant.plan)}-100 text-${getPlanColor(tenant.plan)}-800`}>
                        <Crown className="w-3 h-3 mr-1" />
                        {tenant.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {tenant.usage?.currentUsers || 0} / {tenant.settings?.maxUsers || 5}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tenant.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : tenant.status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tenant.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleView(tenant)}
                          className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(tenant)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit Tenant"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {tenant.status === 'active' ? (
                          <button 
                           onClick={() => handleSuspend(tenant._id, tenant.name)}
                            className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Suspend Tenant"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleReactivate(tenant._id)}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Reactivate Tenant"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(tenant._id, tenant.name)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <TenantModal
          tenant={selectedTenant}
          onClose={() => {
            setShowModal(false);
            setSelectedTenant(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedTenant(null);
            fetchTenants();
          }}
        />
      )}

    {viewingTenant && (
  <TenantDetailsModal
    tenant={viewingTenant}
    onClose={() => setViewingTenant(null)}
    onEdit={(tenant) => {
      handleEdit(tenant);
      setViewingTenant(null);
    }}
  />
)}
    </div>
  );
};

// View Modal Component
const ViewTenantModal = ({ tenant, onClose, onEdit }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          {/* <X className="w-5 h-5" /> */}
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Organization</p>
            <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Subdomain</p>
            <p className="font-medium text-gray-900 dark:text-white">{tenant.slug}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{tenant.plan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{tenant.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {tenant.usage?.currentUsers || 0} / {tenant.settings?.maxUsers || 5}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(tenant.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Close
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Edit Tenant
        </button>
      </div>
    </div>
  </div>
);

export default TenantsPage;