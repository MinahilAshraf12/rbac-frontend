import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Eye,
  Lock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Settings,
  Save,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';

const RolesPage = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [showManagePermissionsModal, setShowManagePermissionsModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  // const API_URL = 'http://localhost:5000'; 
  const API_URL = process.env.REACT_APP_API_URL;

  // Available resources and actions from your backend
  const availableResources = ['users', 'roles', 'categories', 'permissions', 'dashboard', 'settings'];
  const availableActions = ['create', 'read', 'update', 'delete', 'manage'];



 const fetchRoles = useCallback(async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${API_URL}/api/roles`);
    setRoles(response.data.data);
  } catch (error) {
    toast.error('Error fetching roles');
    console.error('Fetch roles error:', error);
  } finally {
    setLoading(false);
  }
}, [API_URL]);
 useEffect(() => {
  fetchRoles();
}, [fetchRoles]);
  const createRole = async (roleData) => {
    try {
      setActionLoading(true);
      const response = await axios.post(`${API_URL}/api/roles`, roleData);
      setRoles([...roles, response.data.data]);
      setShowCreateModal(false);
      toast.success('Role created successfully');
      fetchRoles(); // Refresh to get updated data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating role');
    } finally {
      setActionLoading(false);
    }
  };

  const updateRole = async (roleId, roleData) => {
    try {
      setActionLoading(true);
     const response = await axios.put(`${API_URL}/api/roles/${roleId}`, roleData);
      setRoles(roles.map(role => role._id === roleId ? response.data.data : role));
      setShowEditModal(false);
      setEditingRole(null);
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating role');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteRole = async (roleId) => {
    try {
      setActionLoading(true);
      await axios.delete(`${API_URL}/api/roles/${roleId}`);
      setRoles(roles.filter(role => role._id !== roleId));
      setShowDeleteModal(false);
      setSelectedRole(null);
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting role');
    } finally {
      setActionLoading(false);
    }
  };

  const updateRolePermissions = async (roleId, permissions) => {
    try {
      setActionLoading(true);
      const response = await axios.put(`${API_URL}/api/roles/${roleId}/permissions`, { permissions });
      setRoles(roles.map(role => role._id === roleId ? response.data.data : role));
      toast.success('Permissions updated successfully');
      fetchRoles(); // Refresh roles
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating permissions');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAndSortedRoles = roles
    .filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'system') return matchesSearch && role.isSystemRole;
      if (filterBy === 'custom') return matchesSearch && !role.isSystemRole;
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'permissions':
          comparison = a.permissions.length - b.permissions.length;
          break;
        case 'created':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getRoleStats = (role) => {
    const totalPermissions = role.permissions.length;
    const totalActions = role.permissions.reduce((acc, perm) => acc + perm.actions.length, 0);
    return { totalPermissions, totalActions };
  };

  const getPriorityColor = (priority) => {
    if (priority >= 80) return 'bg-red-500';
    if (priority >= 60) return 'bg-orange-500';
    if (priority >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const canRead = hasPermission('roles', 'read');
  const canCreate = hasPermission('roles', 'create');
  const canUpdate = hasPermission('roles', 'update');
  const canDelete = hasPermission('roles', 'delete');
  const canManage = hasPermission('roles', 'manage');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have permission to view roles.
          </p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Roles Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage system roles and their permissions ({roles.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRoles}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          {(canCreate || canManage) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {/* Filter */}
          <div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="priority">Priority</option>
              <option value="name">Name</option>
              <option value="permissions">Permissions</option>
              <option value="created">Created Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAndSortedRoles.map((role, index) => {
            const { totalPermissions, totalActions } = getRoleStats(role);
            
            return (
              <motion.div
                key={role._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getPriorityColor(role.priority)} rounded-xl flex items-center justify-center`}>
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {role.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {role.isSystemRole && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              <Lock className="w-3 h-3 mr-1" />
                              System
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Priority: {role.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRole(role)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(canUpdate || canManage) && !role.isSystemRole && (
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {(canDelete || canManage) && !role.isSystemRole && (
                        <button
                          onClick={() => {
                            setSelectedRole(role);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                    {role.description}
                  </p>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {totalPermissions}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Resources
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {totalActions}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Actions
                        </div>
                      </div>
                    </div>

                    {/* Permissions Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Permissions
                      </h4>
                      <div className="space-y-2">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <div key={permission.resource} className="flex items-center justify-between text-xs">
                            <span className="capitalize text-gray-600 dark:text-gray-400">
                              {permission.resource}
                            </span>
                            <div className="flex space-x-1">
                              {permission.actions.slice(0, 3).map((action) => (
                                <span
                                  key={action}
                                  className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded capitalize"
                                >
                                  {action === 'manage' ? 'all' : action.charAt(0)}
                                </span>
                              ))}
                              {permission.actions.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                  +{permission.actions.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {role.permissions.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                            +{role.permissions.length - 3} more resources
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created {new Date(role.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {(canUpdate || canManage) && (
                      <button 
                        onClick={() => {
                          setSelectedRole(role);
                          setShowManagePermissionsModal(true);
                        }}
                        className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Manage</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredAndSortedRoles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No roles found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first role'}
          </p>
          {(canCreate || canManage) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedRole && !showDeleteModal && !showEditModal && (
          <RoleDetailsModal
            role={selectedRole}
            onClose={() => setSelectedRole(null)}
          />
        )}
        
        {showCreateModal && (
          <CreateRoleModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={createRole}
            loading={actionLoading}
            availableResources={availableResources}
            availableActions={availableActions}
          />
        )}
        
        {showEditModal && editingRole && (
          <EditRoleModal
            role={editingRole}
            onClose={() => {
              setShowEditModal(false);
              setEditingRole(null);
            }}
            onSubmit={updateRole}
            loading={actionLoading}
            availableResources={availableResources}
            availableActions={availableActions}
          />
        )}
        
        {showDeleteModal && selectedRole && (
          <DeleteConfirmationModal
            role={selectedRole}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedRole(null);
            }}
            onConfirm={() => deleteRole(selectedRole._id)}
            loading={actionLoading}
          />
        )}
        
        {showManagePermissionsModal && selectedRole && (
          <ManagePermissionsModal
            role={selectedRole}
            onClose={() => {
              setShowManagePermissionsModal(false);
              setSelectedRole(null);
            }}
            onUpdatePermissions={updateRolePermissions}
            loading={actionLoading}
            availableResources={availableResources}
            availableActions={availableActions}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Role Details Modal Component (Enhanced)
const RoleDetailsModal = ({ role, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {role.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {role.isSystemRole && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white bg-opacity-20 text-white">
                      <Lock className="w-3 h-3 mr-1" />
                      System Role
                    </span>
                  )}
                  <span className="text-xs text-primary-100">
                    Priority: {role.priority}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Description
              </h4>
              <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {role.description}
              </p>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Permissions ({role.permissions.length} resources)
              </h4>
              <div className="space-y-3">
                {role.permissions.map((permission) => (
                  <div
                    key={permission.resource}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                        {permission.resource}
                      </h5>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.actions.length} actions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {permission.actions.map((action) => (
                        <span
                          key={action}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            action === 'manage'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                              : action === 'delete'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                              : action === 'update'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                              : action === 'create'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Role Information
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(role.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Modified:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(role.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Role ID:</span>
                  <span className="text-sm text-gray-900 dark:text-white font-mono">
                    {role._id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Create Role Modal Component
const CreateRoleModal = ({ onClose, onSubmit, loading, availableResources, availableActions }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 0,
    permissions: []
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.priority < 0 || formData.priority > 100) {
      newErrors.priority = 'Priority must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handlePermissionChange = (resource, action, checked) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const existingPermIndex = permissions.findIndex(p => p.resource === resource);
      
      if (existingPermIndex >= 0) {
        if (checked) {
          if (!permissions[existingPermIndex].actions.includes(action)) {
            permissions[existingPermIndex].actions.push(action);
          }
        } else {
          permissions[existingPermIndex].actions = permissions[existingPermIndex].actions.filter(a => a !== action);
          if (permissions[existingPermIndex].actions.length === 0) {
            permissions.splice(existingPermIndex, 1);
          }
        }
      } else if (checked) {
        permissions.push({ resource, actions: [action] });
      }
      
      return { ...prev, permissions };
    });
  };

  const isActionChecked = (resource, action) => {
    const permission = formData.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Create New Role</h3>
            <button onClick={onClose} className="text-white hover:text-primary-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter role name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority (0-100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.priority ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter priority (0-100)"
                />
                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Enter role description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Permissions
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                          Resource
                        </th>
                        {availableActions.map(action => (
                          <th key={action} className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 pb-2 capitalize">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {availableResources.map(resource => (
                        <tr key={resource} className="border-t border-gray-200 dark:border-gray-600">
                          <td className="py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {resource}
                          </td>
                          {availableActions.map(action => (
                            <td key={action} className="py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isActionChecked(resource, action)}
                                onChange={(e) => handlePermissionChange(resource, action, e.target.checked)}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Role'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Edit Role Modal Component
const EditRoleModal = ({ role, onClose, onSubmit, loading, availableResources, availableActions }) => {
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description,
    priority: role.priority,
    permissions: role.permissions
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.priority < 0 || formData.priority > 100) {
      newErrors.priority = 'Priority must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(role._id, formData);
    }
  };

  const handlePermissionChange = (resource, action, checked) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const existingPermIndex = permissions.findIndex(p => p.resource === resource);
      
      if (existingPermIndex >= 0) {
        if (checked) {
          if (!permissions[existingPermIndex].actions.includes(action)) {
            permissions[existingPermIndex].actions.push(action);
          }
        } else {
          permissions[existingPermIndex].actions = permissions[existingPermIndex].actions.filter(a => a !== action);
          if (permissions[existingPermIndex].actions.length === 0) {
            permissions.splice(existingPermIndex, 1);
          }
        }
      } else if (checked) {
        permissions.push({ resource, actions: [action] });
      }
      
      return { ...prev, permissions };
    });
  };

  const isActionChecked = (resource, action) => {
    const permission = formData.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Edit Role: {role.name}</h3>
            <button onClick={onClose} className="text-white hover:text-primary-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {role.isSystemRole && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This is a system role. Some changes may be restricted.
                  </p>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={role.isSystemRole}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter role name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority (0-100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  disabled={role.isSystemRole}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.priority ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter priority (0-100)"
                />
                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Enter role description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Permissions
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                          Resource
                        </th>
                        {availableActions.map(action => (
                          <th key={action} className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 pb-2 capitalize">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {availableResources.map(resource => (
                        <tr key={resource} className="border-t border-gray-200 dark:border-gray-600">
                          <td className="py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {resource}
                          </td>
                          {availableActions.map(action => (
                            <td key={action} className="py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isActionChecked(resource, action)}
                                onChange={(e) => handlePermissionChange(resource, action, e.target.checked)}
                                disabled={role.isSystemRole}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Role'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ role, onClose, onConfirm, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Role
            </h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete the role <strong>"{role.name}"</strong>? 
            This action cannot be undone and will affect all users assigned to this role.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Role'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Manage Permissions Modal - Dedicated modal for editing role permissions
const ManagePermissionsModal = ({ role, onClose, onUpdatePermissions, loading, availableResources, availableActions }) => {
  const [permissions, setPermissions] = useState(role.permissions || []);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPermissions(role.permissions || []);
    setHasChanges(false);
  }, [role]);

  const handlePermissionChange = (resource, action, checked) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      const existingPermIndex = newPermissions.findIndex(p => p.resource === resource);
      
      if (existingPermIndex >= 0) {
        if (checked) {
          if (!newPermissions[existingPermIndex].actions.includes(action)) {
            newPermissions[existingPermIndex].actions.push(action);
          }
        } else {
          newPermissions[existingPermIndex].actions = newPermissions[existingPermIndex].actions.filter(a => a !== action);
          if (newPermissions[existingPermIndex].actions.length === 0) {
            newPermissions.splice(existingPermIndex, 1);
          }
        }
      } else if (checked) {
        newPermissions.push({ resource, actions: [action] });
      }
      
      return newPermissions;
    });
    setHasChanges(true);
  };

  const isActionChecked = (resource, action) => {
    const permission = permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  const handleSelectAll = (resource) => {
    setPermissions(prev => {
      const newPermissions = [...prev];
      const existingPermIndex = newPermissions.findIndex(p => p.resource === resource);
      
      if (existingPermIndex >= 0) {
        newPermissions[existingPermIndex].actions = [...availableActions];
      } else {
        newPermissions.push({ resource, actions: [...availableActions] });
      }
      
      return newPermissions;
    });
    setHasChanges(true);
  };

  const handleDeselectAll = (resource) => {
    setPermissions(prev => {
      const newPermissions = prev.filter(p => p.resource !== resource);
      return newPermissions;
    });
    setHasChanges(true);
  };

  const isResourceFullySelected = (resource) => {
    const permission = permissions.find(p => p.resource === resource);
    return permission && permission.actions.length === availableActions.length;
  };

  const getResourceActionCount = (resource) => {
    const permission = permissions.find(p => p.resource === resource);
    return permission ? permission.actions.length : 0;
  };

  const handleSave = async () => {
    await onUpdatePermissions(role._id, permissions);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPermissions(role.permissions || []);
    setHasChanges(false);
  };

  const getTotalPermissionsCount = () => {
    return permissions.reduce((acc, perm) => acc + perm.actions.length, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Manage Permissions: {role.name}
                </h3>
                <p className="text-sm text-primary-100 mt-1">
                  Configure access permissions for this role
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-primary-100 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Role Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>{role.name}</span>
                  {role.isSystemRole && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      <Lock className="w-3 h-3 mr-1" />
                      System
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Permissions:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {getTotalPermissionsCount()} actions across {permissions.length} resources
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className="font-medium">
                  {hasChanges ? (
                    <span className="text-orange-600 dark:text-orange-400">
                      Unsaved Changes
                    </span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {role.isSystemRole && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    System Role Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This is a system role. Modifying permissions may affect core system functionality. 
                    Changes to system roles are restricted and may not be saved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Grid */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Resource Permissions
            </h4>
            
            <div className="grid gap-4">
              {availableResources.map(resource => (
                <div key={resource} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  {/* Resource Header */}
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h5 className="text-base font-medium text-gray-900 dark:text-white capitalize">
                          {resource}
                        </h5>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getResourceActionCount(resource)} of {availableActions.length} actions
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSelectAll(resource)}
                          disabled={role.isSystemRole || isResourceFullySelected(resource)}
                          className="px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => handleDeselectAll(resource)}
                          disabled={role.isSystemRole || getResourceActionCount(resource) === 0}
                          className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {availableActions.map(action => (
                        <label key={action} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isActionChecked(resource, action)}
                            onChange={(e) => handlePermissionChange(resource, action, e.target.checked)}
                            disabled={role.isSystemRole}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className={`text-sm capitalize ${
                            isActionChecked(resource, action) 
                              ? 'text-gray-900 dark:text-white font-medium' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {action}
                          </span>
                          {action === 'manage' && (
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              (All)
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Summary */}
          {permissions.length > 0 && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Current Permissions Summary
              </h4>
              <div className="flex flex-wrap gap-2">
                {permissions.map(permission => (
                  <div key={permission.resource} className="inline-flex items-center bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
                    <span className="capitalize font-medium">{permission.resource}</span>
                    <span className="ml-2 text-blue-600 dark:text-blue-300">
                      {permission.actions.includes('manage') ? 'All' : permission.actions.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {hasChanges && (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
              {!role.isSystemRole && (
                <button
                  onClick={handleSave}
                  disabled={loading || !hasChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 inline" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RolesPage;