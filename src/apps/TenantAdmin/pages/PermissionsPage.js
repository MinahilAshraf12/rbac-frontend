import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Eye,
  Edit2,
  Trash2,
  Plus,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  Settings,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

const PermissionsPage = () => {
  const { user, hasPermission } = useAuth(); // Make sure hasPermission exists in your AuthContext
  const [permissionsMatrix, setPermissionsMatrix] = useState([]);
  const [resources, setResources] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalMatrix, setOriginalMatrix] = useState([]);
  const [filterResource, setFilterResource] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState({});
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchPermissionsMatrix();
    fetchPermissionTemplates();
  }, []);

 const fetchPermissionsMatrix = async () => {
  try {
    setLoading(true);
    
    // Check if user is authenticated
    if (!user) {
      console.log('No user found, user needs to login');
      toast.error('Please login to access this page');
      return;
    }

    // Get the token
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      toast.error('No authentication token found. Please login again.');
      return;
    }

    console.log('Making request to /api/roles/permissions-matrix with token');
    
    const response = await axios.get(`${API_URL}/api/roles/permissions-matrix`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response received:', response.data);
    
    if (response.data.success) {
      const { matrix, resources: resArray, actions: actArray } = response.data.data;
      
      setPermissionsMatrix(matrix || []);
      setOriginalMatrix(JSON.parse(JSON.stringify(matrix || [])));
      setResources(resArray || []);
      setActions(actArray || []);
    } else {
      throw new Error(response.data.message || 'Failed to fetch permissions matrix');
    }
  } catch (error) {
    console.error('Error fetching permissions matrix:', error);
    console.error('Error response:', error.response?.data);
    
    if (error.response?.status === 401) {
      toast.error('Your session has expired. Please login again.');
      // You might want to redirect to login page here
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching permissions matrix';
      toast.error(errorMessage);
    }
    
    // Set empty defaults on error
    setPermissionsMatrix([]);
    setOriginalMatrix([]);
    setResources(['users', 'roles', 'categories', 'permissions', 'dashboard', 'settings']);
    setActions(['create', 'read', 'update', 'delete', 'manage']);
  } finally {
    setLoading(false);
  }
};

  const fetchPermissionTemplates = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token for templates request');
      return;
    }

    const response = await axios.get(`${API_URL}/api/permissions/templates`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      setTemplates(response.data.data || {});
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    setTemplates({});
  }
};

  // Safe hasPermission function with fallback
  const safeHasPermission = (resource, action) => {
    if (typeof hasPermission === 'function') {
      return hasPermission(resource, action);
    }
    
    // Fallback: check user role permissions directly if hasPermission is not available
    if (user?.role?.permissions) {
      return user.role.permissions.some(permission => 
        permission.resource === resource && 
        (permission.actions.includes(action) || permission.actions.includes('manage'))
      );
    }
    
    // Default to false if we can't determine permissions
    return false;
  };

  const handlePermissionToggle = (roleIndex, resource, action) => {
    if (!safeHasPermission('roles', 'update')) {
      toast.error('You do not have permission to modify permissions');
      return;
    }

    if (roleIndex < 0 || roleIndex >= permissionsMatrix.length) {
      toast.error('Invalid role index');
      return;
    }

    const role = permissionsMatrix[roleIndex];
    if (role?.role?.isSystemRole) {
      toast.error('Cannot modify system role permissions');
      return;
    }

    const updatedMatrix = [...permissionsMatrix];
    const currentValue = updatedMatrix[roleIndex]?.permissions?.[resource]?.[action] || false;
    
    // Ensure the structure exists
    if (!updatedMatrix[roleIndex].permissions[resource]) {
      updatedMatrix[roleIndex].permissions[resource] = {};
    }
    
    updatedMatrix[roleIndex].permissions[resource][action] = !currentValue;
    
    setPermissionsMatrix(updatedMatrix);
    setHasChanges(true);
  };

  const handleBulkPermissionUpdate = (resource, action, enabled) => {
    if (!bulkEditMode || selectedRoles.length === 0) return;
    if (!safeHasPermission('roles', 'update')) {
      toast.error('You do not have permission to modify permissions');
      return;
    }

    const updatedMatrix = [...permissionsMatrix];
    let updateCount = 0;
    
    selectedRoles.forEach(roleId => {
      const roleIndex = updatedMatrix.findIndex(r => r.role.id === roleId);
      if (roleIndex !== -1 && !updatedMatrix[roleIndex].role.isSystemRole) {
        // Ensure the structure exists
        if (!updatedMatrix[roleIndex].permissions[resource]) {
          updatedMatrix[roleIndex].permissions[resource] = {};
        }
        updatedMatrix[roleIndex].permissions[resource][action] = enabled;
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      setPermissionsMatrix(updatedMatrix);
      setHasChanges(true);
      toast.success(`Updated ${updateCount} roles`);
    }
  };

  const handleSelectRole = (roleId) => {
    if (!bulkEditMode) return;
    
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSaveChanges = async () => {
    if (!hasChanges || saving) return;
    if (!safeHasPermission('roles', 'update')) {
      toast.error('You do not have permission to modify permissions');
      return;
    }

    setSaving(true);
    try {
      const updates = [];
      
      permissionsMatrix.forEach((roleData) => {
        const originalRole = originalMatrix.find(r => r.role.id === roleData.role.id);
        if (!originalRole) return;

        const originalPermissions = getPermissionsFromMatrix(originalRole);
        const newPermissions = getPermissionsFromMatrix(roleData);
        
        if (JSON.stringify(originalPermissions) !== JSON.stringify(newPermissions)) {
          updates.push({
            roleId: roleData.role.id,
            permissions: newPermissions
          });
        }
      });

      if (updates.length === 0) {
        toast.success('No changes to save');
        setHasChanges(false);
        return;
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

 const response = await axios.put(
  `${API_URL}/api/roles/bulk-permissions`,
  { updates },
  config
);

      
      if (response.data.success) {
        toast.success(`Updated permissions for ${updates.length} role(s)`);
        setHasChanges(false);
        setOriginalMatrix(JSON.parse(JSON.stringify(permissionsMatrix)));
        setBulkEditMode(false);
        setSelectedRoles([]);
      } else {
        throw new Error(response.data.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error updating permissions';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleResetChanges = () => {
    setPermissionsMatrix(JSON.parse(JSON.stringify(originalMatrix)));
    setHasChanges(false);
    setBulkEditMode(false);
    setSelectedRoles([]);
    toast.success('Changes reset');
  };

  const handleApplyTemplate = async (roleId, templateKey) => {
    if (!safeHasPermission('roles', 'update')) {
      toast.error('You do not have permission to modify permissions');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.put(
  `${API_URL}/api/roles/${roleId}/apply-template`,
  { template: templateKey },
  config
);

      
      if (response.data.success) {
        toast.success('Template applied successfully');
        await fetchPermissionsMatrix();
      } else {
        throw new Error(response.data.message || 'Failed to apply template');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error applying template';
      toast.error(errorMessage);
    }
  };

  const getPermissionsFromMatrix = (roleData) => {
    if (!roleData || !roleData.permissions) return [];
    
    return Object.keys(roleData.permissions).map(resource => {
      const resourceActions = [];
      Object.keys(roleData.permissions[resource] || {}).forEach(action => {
        if (roleData.permissions[resource][action]) {
          resourceActions.push(action);
        }
      });
      
      return {
        resource,
        actions: resourceActions
      };
    }).filter(perm => perm.actions.length > 0);
  };

  const exportPermissions = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      exportedBy: user?.name || 'Unknown',
      roles: permissionsMatrix.map(roleData => ({
        role: roleData.role.name,
        permissions: getPermissionsFromMatrix(roleData)
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-export-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Permissions exported successfully');
  };

  const getPermissionStats = () => {
    const stats = {
      totalRoles: permissionsMatrix.length,
      systemRoles: permissionsMatrix.filter(r => r.role.isSystemRole).length,
      customRoles: permissionsMatrix.filter(r => !r.role.isSystemRole).length,
      changedRoles: 0
    };

    permissionsMatrix.forEach((roleData) => {
      const originalRole = originalMatrix.find(r => r.role.id === roleData.role.id);
      if (originalRole && JSON.stringify(getPermissionsFromMatrix(roleData)) !== JSON.stringify(getPermissionsFromMatrix(originalRole))) {
        stats.changedRoles++;
      }
    });

    return stats;
  };

  const filteredMatrix = permissionsMatrix.filter(roleData => {
    if (!roleData || !roleData.role) return false;

    const matchesSearch = (roleData.role.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (roleData.role.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResource = !filterResource || 
      Object.keys(roleData.permissions?.[filterResource] || {}).some(action => 
        roleData.permissions[filterResource][action]
      );
    
    return matchesSearch && matchesResource;
  });

  const canUpdate = safeHasPermission('roles', 'update');
  const stats = getPermissionStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Permissions Matrix
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage role-based permissions across system resources
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportPermissions}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {canUpdate && (
            <button
              onClick={() => setBulkEditMode(!bulkEditMode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                bulkEditMode 
                  ? 'text-white bg-primary-600 hover:bg-primary-700' 
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}</span>
            </button>
          )}

          {hasChanges && canUpdate && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <button
                onClick={handleResetChanges}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.customRoles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Changed Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.changedRoles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Resources</option>
            {resources.map(resource => (
              <option key={resource} value={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Templates</span>
          </button>
          
          {hasChanges && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                {stats.changedRoles} role(s) modified
              </span>
            </div>
          )}
          
          {bulkEditMode && selectedRoles.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                {selectedRoles.length} role(s) selected
              </span>
            </div>
          )}
        </div>

        {/* Permission Templates */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Permission Templates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(templates).map(([key, template]) => (
                  <div
                    key={key}
                    className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {template.description}
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {template.permissions?.length || 0} permission(s)
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {bulkEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Bulk Edit Mode
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-200">
                  Select roles and click on permission cells to apply changes to multiple roles
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const customRoles = permissionsMatrix
                      .filter(r => !r.role.isSystemRole)
                      .map(r => r.role.id);
                    setSelectedRoles(customRoles);
                  }}
                  className="px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                >
                  Select All Custom
                </button>
                <button
                  onClick={() => setSelectedRoles([])}
                  className="px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Role Permissions Matrix
              </h3>
            </div>
            {filteredMatrix.length !== permissionsMatrix.length && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredMatrix.length} of {permissionsMatrix.length} roles
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {bulkEditMode 
              ? 'Select roles and click permission cells to bulk edit'
              : 'Click to toggle permissions for each role and resource combination'
            }
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50 dark:bg-primary-900/20">
              <tr>
                {bulkEditMode && (
                  <th className="px-4 py-4 text-center text-sm font-semibold text-primary-900 dark:text-primary-100 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRoles.length === permissionsMatrix.filter(r => !r.role.isSystemRole).length && permissionsMatrix.filter(r => !r.role.isSystemRole).length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const customRoles = permissionsMatrix
                            .filter(r => !r.role.isSystemRole)
                            .map(r => r.role.id);
                          setSelectedRoles(customRoles);
                        } else {
                          setSelectedRoles([]);
                        }
                      }}
                      className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-900 dark:text-primary-100 min-w-[200px]">
                  Roles
                </th>
                {resources.map(resource => (
                  <th key={resource} className="px-3 py-4 text-center text-sm font-semibold text-primary-900 dark:text-primary-100 min-w-[120px]">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="capitalize">{resource}</span>
                      <div className="flex space-x-1">
                        {actions.map(action => (
                          <span
                            key={action}
                            className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded capitalize cursor-pointer"
                            title={`${action} ${resource}`}
                            onClick={() => bulkEditMode && selectedRoles.length > 0 && handleBulkPermissionUpdate(resource, action, true)}
                          >
                            {action.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </th>
                ))}
                {canUpdate && (
                  <th className="px-4 py-4 text-center text-sm font-semibold text-primary-900 dark:text-primary-100 w-24">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredMatrix.map((roleData, roleIndex) => {
                  const originalRoleIndex = permissionsMatrix.findIndex(r => r.role.id === roleData.role.id);
                  const isSelected = selectedRoles.includes(roleData.role.id);
                  const hasRoleChanges = originalMatrix.find(r => r.role.id === roleData.role.id) &&
                    JSON.stringify(getPermissionsFromMatrix(roleData)) !== 
                    JSON.stringify(getPermissionsFromMatrix(originalMatrix.find(r => r.role.id === roleData.role.id)));
                  
                  return (
                    <motion.tr
                      key={roleData.role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: roleIndex * 0.02 }}
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      } ${hasRoleChanges ? 'border-l-4 border-yellow-400' : ''}`}
                    >
                      {bulkEditMode && (
                        <td className="px-4 py-4 text-center">
                          {!roleData.role.isSystemRole && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRole(roleData.role.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            roleData.role.isSystemRole
                              ? 'bg-gradient-to-r from-gray-500 to-gray-600'
                              : 'bg-gradient-to-r from-primary-500 to-primary-600'
                          }`}>
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {roleData.role.name}
                              {hasRoleChanges && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                  Modified
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {roleData.role.description}
                            </p>
                            {roleData.role.isSystemRole && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 mt-1">
                                <Lock className="w-3 h-3 mr-1" />
                                System Role
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {resources.map(resource => (
                        <td key={resource} className="px-3 py-4">
                          <div className="grid grid-cols-2 gap-1">
                            {actions.map(action => {
                              const hasPermission = roleData.permissions?.[resource]?.[action] || false;
                              const isSystemRole = roleData.role.isSystemRole;
                              
                              return (
                                <button
                                  key={action}
                                  disabled={isSystemRole || !canUpdate}
                                  onClick={() => {
                                    if (bulkEditMode && selectedRoles.length > 0) {
                                      handleBulkPermissionUpdate(resource, action, !hasPermission);
                                    } else {
                                      handlePermissionToggle(originalRoleIndex, resource, action);
                                    }
                                  }}
                                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 ${
                                    hasPermission
                                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                                      : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400'
                                  } ${
                                    isSystemRole || !canUpdate
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'cursor-pointer hover:scale-105'
                                  }`}
                                  title={`${action.charAt(0).toUpperCase() + action.slice(1)} ${resource} - ${hasPermission ? 'Enabled' : 'Disabled'}`}
                                >
                                  {hasPermission ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                      {canUpdate && (
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-1">
                            {!roleData.role.isSystemRole && (
                              <div className="relative">
                                <button
                                  onClick={() => setSelectedRole(selectedRole === roleData.role.id ? null : roleData.role.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                  title="Apply template"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                
                                <AnimatePresence>
                                  {selectedRole === roleData.role.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      className="absolute right-0 top-8 z-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
                                    >
                                      {Object.entries(templates).map(([key, template]) => (
                                        <button
                                          key={key}
                                          onClick={() => {
                                            handleApplyTemplate(roleData.role.id, key);
                                            setSelectedRole(null);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                          <div className="font-medium">{template.name}</div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {template.permissions?.length || 0} permissions
                                          </div>
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-300">Permission Granted</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Permission Denied</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded">C</span>
              <span className="text-gray-600 dark:text-gray-300">Create</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded">R</span>
              <span className="text-gray-600 dark:text-gray-300">Read</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded">U</span>
              <span className="text-gray-600 dark:text-gray-300">Update</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded">D</span>
              <span className="text-gray-600 dark:text-gray-300">Delete</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded">M</span>
              <span className="text-gray-600 dark:text-gray-300">Manage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Permission Management Guidelines
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• System roles (marked with lock icon) cannot be modified for security</p>
              <p>• The "manage" permission includes all other permissions for that resource</p>
              <p>• Use bulk edit mode to efficiently update multiple roles at once</p>
              <p>• Apply templates to quickly configure common permission sets</p>
              <p>• Changes are saved in bulk to ensure consistency</p>
              <p>• Users may need to re-login to see updated permissions</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PermissionsPage;