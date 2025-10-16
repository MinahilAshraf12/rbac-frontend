import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  User,
  Mail,
  Calendar,
  Shield,
  Check,
  X,
  Grid3X3,
  List,
} from 'lucide-react';
import api from '../../../config/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
// Add these imports
import { useSubscription } from '../../../contexts/SubscriptionContext';
import UsageLimitWarning from '../../../shared/components/UsageLimitWarning';
import UpgradeModal from '../../../shared/components/UpgradeModal';
// const API_URL = process.env.REACT_APP_API_URL;

// User View Modal Component - Moved outside and above the main component
const UserViewModal = ({ user, onClose, onEdit, canUpdate }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
        animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-4 sm:p-6 space-y-6">
            {/* User Avatar & Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {user.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {user.isActive ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <X className="w-3 h-3 mr-1" />
                    )}
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</span>
                </div>
                <p className="text-base text-gray-900 dark:text-white">
                  {user.role?.name || 'No Role Assigned'}
                </p>
                {user.role?.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {user.role.description}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</span>
                </div>
                <p className="text-base text-gray-900 dark:text-white">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : 'Never logged in'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</span>
                </div>
                <p className="text-base text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {user.lastUpdated && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</span>
                  </div>
                  <p className="text-base text-gray-900 dark:text-white">
                    {new Date(user.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {canUpdate && (
          <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="w-full sm:w-auto px-4 py-3 text-base  text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit User</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Mobile-Optimized User Modal Component
const UserModal = ({ user, roles, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roleId: user?.role?._id || '',
    isActive: user?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (user) {
      // ✅ Update user
      await api.put(`/api/users/${user._id}`, {
        name: formData.name,
        email: formData.email,
        roleId: formData.roleId,
        isActive: formData.isActive,
      });
      toast.success('User updated successfully');
    } else {
      // ✅ Create user
      await api.post('/api/users', formData);
      toast.success('User created successfully');
    }
    onSuccess();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Operation failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
        animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user ? 'Edit User' : 'Create User'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                placeholder="user@example.com"
              />
            </div>

            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required={!user}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  placeholder="Enter secure password"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                required
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Active User
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  User can log in and access the system
                </p>
              </label>
            </div>
          </form>
        </div>

        {/* Footer Actions - Mobile Optimized */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full sm:w-auto px-4 py-3 text-base text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const UsersPage = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [isMobile, setIsMobile] = useState(false);
  const [viewingUser, setViewingUser] = useState(null); // For user details modal
 const { checkLimit } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const userLimit = checkLimit('user');
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, selectedRole, selectedStatus]);

 const fetchUsers = useCallback(async () => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      ...(searchTerm && { search: searchTerm }),
      ...(selectedRole && { role: selectedRole }),
      ...(selectedStatus && { status: selectedStatus }),
    });

    // ✅ Use api.js instead of axios
    const response = await api.get(`/api/users?${params}`);

    setUsers(response.data.data);
    setTotalPages(response.data.pagination.pages);
  } catch (error) {
    toast.error('Error fetching users');
  } finally {
    setLoading(false);
  }
}, [page, searchTerm, selectedRole, selectedStatus]);

const fetchRoles = async () => {
  try {
    // ✅ Use api.js instead of axios
    const response = await api.get('/api/roles');
    setRoles(response.data.data);
  } catch (error) {
    console.error('Error fetching roles:', error);
  }
};
 const handleDeleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;

  try {
    // ✅ Use api.js instead of axios
    await api.delete(`/api/users/${userId}`);
    toast.success('User deleted successfully');
    fetchUsers();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Error deleting user');
  }
};

  const canCreate = hasPermission('users', 'create');
  const canUpdate = hasPermission('users', 'update');
  const canDelete = hasPermission('users', 'delete');

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            ))}
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
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Users
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Toggle - Hidden on mobile for space */}
            {!isMobile && (
              <div className="hidden lg:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'card'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
 {userLimit.percentage > 75 && (
        <div className="px-4 py-3 sm:px-6">
          <UsageLimitWarning
            feature="user"
            current={userLimit.current}
            limit={userLimit.limit}
            percentage={userLimit.percentage}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        </div>
      )}
      {/* Search Bar - Mobile Priority */}
      <div className="px-4 py-3 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
              showFilters
                ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-4 py-4 sm:px-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="px-4 py-4 sm:px-6 space-y-4">
        {/* Mobile Card View (Default) / Desktop can switch */}
        {(viewMode === 'card' || isMobile) && (
          <div className="space-y-3">
            <AnimatePresence>
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {user.role?.name || 'No Role'}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                          >
                            {user.isActive ? (
                              <Check className="w-3 h-3 mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions - Mobile Optimized */}
                    <div className="flex flex-col space-y-1 ml-2">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setViewingUser(user)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="View user details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Info - Collapsible on Mobile */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          Last: {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Never'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Desktop Table View */}
        {viewMode === 'table' && !isMobile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <Mail className="w-3 h-3" />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {user.role?.name || 'No Role'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                          >
                            {user.isActive ? (
                              <Check className="w-3 h-3 mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleDateString()
                                : 'Never'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => setViewingUser(user)}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canUpdate && (
                              <button
                                onClick={() => setEditingUser(user)}
                                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new user.
            </p>
            {canCreate && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  New User
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile-Optimized Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showCreateModal || editingUser) && (
          <UserModal
            user={editingUser}
            roles={roles}
            onClose={() => {
              setShowCreateModal(false);
              setEditingUser(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingUser(null);
              fetchUsers();
            }}
          />
        )}
        
        {viewingUser && (
          <UserViewModal
            user={viewingUser}
            onClose={() => setViewingUser(null)}
            onEdit={() => {
              setEditingUser(viewingUser);
              setViewingUser(null);
            }}
            canUpdate={canUpdate}
          />
        )}
      </AnimatePresence>
      {/* ADD THIS - Upgrade Modal at the end before closing </motion.div> */}
<UpgradeModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  currentPlan="free"
  limitType="user"
/>
    </motion.div>
  );
};

export default UsersPage;