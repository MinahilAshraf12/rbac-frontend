import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  FolderTree,
  User,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Filter,
  MoreVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import api, { ENDPOINTS } from '../../../config/api';

const CategoriesPage = () => {
const { hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Fetch categories with proper error handling
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await api.get(`${ENDPOINTS.CATEGORIES.BASE}?${params}`);
      
      if (response.data && response.data.success) {
        setCategories(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        // Handle case where success is not explicitly set but data exists
        setCategories(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
      setCategories([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedStatus]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(ENDPOINTS.CATEGORIES.DELETE(categoryId));
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Error deleting category');
    }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      await api.put(ENDPOINTS.CATEGORIES.TOGGLE_STATUS(categoryId));
      toast.success('Category status updated successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error(error.response?.data?.message || 'Error updating category status');
    }
  };

  const handleViewCategory = (category) => {
    setViewingCategory(category);
  };

  const canCreate = hasPermission('categories', 'create');
  const canUpdate = hasPermission('categories', 'update');
  const canDelete = hasPermission('categories', 'delete');

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6 p-4 lg:p-0">
        <div className="animate-pulse">
          <div className="h-6 lg:h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 lg:w-1/4 mb-4 lg:mb-6"></div>
          <div className="space-y-3 lg:space-y-0">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block space-y-6"
      >
        {/* Desktop Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Categories Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Organize and manage content categories
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Desktop Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Desktop Categories Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {categories.map((category, index) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <FolderTree className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {category.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {category.description || 'No description'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              category.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                          >
                            {category.isActive ? (
                              <Check className="w-3 h-3 mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {canUpdate && (
                            <button
                              onClick={() => handleToggleStatus(category._id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {category.isActive ? (
                                <ToggleRight className="w-5 h-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {category.createdBy?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewCategory(category)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canUpdate && (
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
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

          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:hidden min-h-screen bg-gray-50 dark:bg-gray-900"
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Categories
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {categories.length} categories
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Filter className="w-5 h-5" />
              </button>
              {canCreate && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex space-x-2">
                    {/* Status Filter */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    {/* Clear Filters */}
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedStatus('');
                      }}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Categories List */}
        <div className="p-4 space-y-3 pb-20">
          <AnimatePresence>
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderTree className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {category.slug}
                      </p>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === category._id ? null : category._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === category._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                        >
                          <button 
                            onClick={() => {
                              handleViewCategory(category);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          {canUpdate && (
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                handleDeleteCategory(category._id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status and Meta Info */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {category.isActive ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {canUpdate && (
                        <button
                          onClick={() => handleToggleStatus(category._id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {category.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-20">
                        {category.createdBy?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(category.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* No Results */}
          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <FolderTree className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No categories found</p>
            </div>
          )}

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* View Category Modal */}
      <AnimatePresence>
        {viewingCategory && (
          <ViewCategoryModal
            category={viewingCategory}
            onClose={() => setViewingCategory(null)}
          />
        )}
      </AnimatePresence>

      {/* Create/Edit Category Modal */}
      <AnimatePresence>
        {(showCreateModal || editingCategory) && (
          <CategoryModal
            category={editingCategory}
            onClose={() => {
              setShowCreateModal(false);
              setEditingCategory(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingCategory(null);
              fetchCategories();
            }}
          />
        )}
      </AnimatePresence>

      {/* Backdrop for dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
};

// View Category Modal Component
const ViewCategoryModal = ({ category, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-800 rounded-t-xl lg:rounded-xl shadow-2xl w-full lg:max-w-md max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="p-4 space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
              </p>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Slug
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {category.slug}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {category.description || 'No description provided'}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  category.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {category.isActive ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Sort Order
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {category.sortOrder}
              </p>
            </div>

            {/* Created By */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Created By
              </label>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {category.createdBy?.name || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Created Date
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(category.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Updated Date */}
            {category.updatedAt && category.updatedAt !== category.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Updated
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(category.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Category Modal Component for Create/Edit
const CategoryModal = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category) {
        await api.put(ENDPOINTS.CATEGORIES.UPDATE(category._id), formData);
        toast.success('Category updated successfully');
      } else {
        await api.post(ENDPOINTS.CATEGORIES.CREATE, formData);
        toast.success('Category created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-800 rounded-t-xl lg:rounded-xl shadow-2xl w-full lg:max-w-md max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {category ? 'Edit Category' : 'Create Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Enter category description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Category
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active categories are visible to users
                </p>
              </div>
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : category ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CategoriesPage;