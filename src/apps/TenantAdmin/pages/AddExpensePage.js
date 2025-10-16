import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  DollarSign,
  FileText,
  Users,
  Calculator,
  Upload,
  File,
  Sparkles,
  Calendar,
  Tag,
  User,
  Receipt,
  Trash2,
  X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../config/api'; 

const API_URL = process.env.REACT_APP_API_URL;

const AddExpensePage = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // ✅ GET SLUG FROM PARAMS
  
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, ] = useState('add');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payments: [{ user: '', category: '', subCategory: '', amount: '', file: null }]
  });

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeUserInput, setActiveUserInput] = useState(null);

  const getFilePreviewUrl = (file) => {
    if (!file || !file.filename) return null;
    return `${API_URL}/api/expenses/file/${file.filename}`;
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  };

  const loadCategories = useCallback(async () => {
    try {
      console.log('📂 Loading categories for AddExpensePage...');
      
      const response = await api.get('/api/categories/simple');
      console.log('✅ Categories API response:', response.data);
      
      const categoriesData = response.data.data || response.data || [];
      console.log('📊 Categories data extracted:', categoriesData);
      
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData);
        console.log('✅ Categories set successfully:', categoriesData.length, 'categories');
      } else {
        console.warn('⚠️ No categories found, using fallback');
        setCategories([
          { _id: '1', name: 'Food' },
          { _id: '2', name: 'General' },
          { _id: '3', name: 'Transport' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([
        { _id: '1', name: 'Food' },
        { _id: '2', name: 'General' },
        { _id: '3', name: 'Transport' }
      ]);
    }
  }, []);

  useEffect(() => {
    console.log('📂 Categories loaded:', categories);
    console.log('📂 Categories count:', categories.length);
    if (categories.length > 0) {
      console.log('📂 First category:', categories[0]);
    }
  }, [categories]);

  const loadExpenseUsers = useCallback(async () => {
    try {
      const result = await api.get('/api/expenses/users');
      
      const usersData = result?.data || result || [];
      const validUsers = Array.isArray(usersData) ? usersData : [];
      
      setUsers(validUsers.length > 0 ? validUsers : [
        'John Doe', 'Jane Smith', 'Mike Johnson'
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(['John Doe', 'Jane Smith', 'Mike Johnson']);
    }
  }, []);

  useEffect(() => {
    console.log('🔗 AddExpensePage tenant slug:', slug);
    loadCategories();
    loadExpenseUsers();
  }, [slug, loadCategories, loadExpenseUsers]);

  const handleBack = () => {
    // ✅ USE SLUG IN NAVIGATION
    navigate(`/tenant/${slug}/expenses`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || formData.payments.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    for (const payment of formData.payments) {
      if (!payment.user || !payment.category || !payment.amount || parseFloat(payment.amount) <= 0) {
        alert('Please provide valid user names, categories, and amounts for all payments');
        return;
      }
    }

    const validPayments = formData.payments.filter(payment => 
      payment.user && payment.category && payment.amount && parseFloat(payment.amount) > 0
    );

    if (validPayments.length === 0) {
      alert('Please add at least one valid payment with user, category, and amount');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description?.trim() || '');
      formDataToSend.append('date', formData.date);
      formDataToSend.append('category', validPayments[0].category);

      const paymentsData = validPayments.map((payment, index) => {
        const paymentData = {
          user: payment.user.trim(),
          amount: parseFloat(payment.amount),
          category: payment.category,
          subCategory: payment.subCategory || ''
        };

        if (mode === 'edit') {
          const hasNewFile = !!payment.file;
          const hasExistingFile = payment.existingFile?.hasFile;
          
          if (hasNewFile) {
            paymentData.fileAction = 'replace';
            paymentData.hasNewFile = true;
            paymentData.hasExistingFile = false;
          } else if (payment.fileAction === 'remove') {
            paymentData.fileAction = 'remove';
            paymentData.hasNewFile = false;
            paymentData.hasExistingFile = false;
          } else if (hasExistingFile) {
            paymentData.fileAction = 'keep';
            paymentData.hasNewFile = false;
            paymentData.hasExistingFile = true;
          }
        } else {
          paymentData.hasNewFile = !!payment.file;
        }

        return paymentData;
      });
      
      formDataToSend.append('payments', JSON.stringify(paymentsData));

      validPayments.forEach((payment, index) => {
        if (payment.file) {
          formDataToSend.append(`payment_${index}`, payment.file, payment.file.name);
        }
      });

      console.log('Sending payments:', JSON.stringify(paymentsData, null, 2));

      const token = localStorage.getItem('tenantToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      if (mode === 'add') {
        response = await fetch(`${API_URL}/api/expenses`, {
          method: 'POST',
          headers: headers,
          body: formDataToSend
        });
      } else if (mode === 'edit') {
        response = await fetch(`${API_URL}/api/expenses/${formData._id}`, {
          method: 'PUT',
          headers: headers,
          body: formDataToSend
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || 'Failed to save expense';
        } catch {
          errorMessage = errorText || 'Failed to save expense';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      alert(`Expense ${mode === 'add' ? 'added' : 'updated'} successfully!`);
      // ✅ USE SLUG IN NAVIGATION
      navigate(`/tenant/${slug}/expenses`, { state: { refreshExpenses: true } });
    } catch (error) {
      console.error('Error saving expense:', error);
      alert(`Failed to ${mode} expense: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentField = () => {
    setFormData({
      ...formData,
      payments: [...formData.payments, { user: '', category: '', subCategory: '', amount: '', file: null }]
    });
  };

  const removePaymentField = (index) => {
    if (formData.payments.length > 1) {
      setFormData({
        ...formData,
        payments: formData.payments.filter((_, i) => i !== index)
      });
    }
  };

  const updatePaymentField = (index, field, value) => {
    const updatedPayments = formData.payments.map((payment, i) => 
      i === index ? { ...payment, [field]: value } : payment
    );
    setFormData({ ...formData, payments: updatedPayments });
  };

  const handleUserInputChange = (index, value) => {
    updatePaymentField(index, 'user', value);
    
    if (value.length > 0) {
      const filtered = users.filter(user => 
        user.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
      setActiveUserInput(index);
    } else {
      setFilteredUsers([]);
      setActiveUserInput(null);
    }
  };

  const selectUser = (index, user) => {
    updatePaymentField(index, 'user', user);
    setFilteredUsers([]);
    setActiveUserInput(null);
  };

  const handleFileUpload = (index, file) => {
    if (file) {
      const updatedPayments = formData.payments.map((payment, i) => 
        i === index ? { 
          ...payment, 
          file: file,
          fileAction: payment.existingFile?.hasFile ? 'replace' : 'add'
        } : payment
      );
      setFormData({ ...formData, payments: updatedPayments });
    }
  };

  const handleFileRemove = (index, type = 'new') => {
    const updatedPayments = formData.payments.map((payment, i) => {
      if (i === index) {
        if (type === 'new') {
          return { ...payment, file: null };
        } else if (type === 'existing') {
          return { 
            ...payment, 
            existingFile: { ...payment.existingFile, hasFile: false },
            fileAction: 'remove'
          };
        }
      }
      return payment;
    });
    setFormData({ ...formData, payments: updatedPayments });
  };

  const calculateTotal = () => {
    return formData.payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPageTitle = () => {
    switch (mode) {
      case 'edit': return 'Edit Expense';
      case 'view': return 'View Expense';
      default: return 'Add New Expense';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'edit': return 'Update your expense details';
      case 'view': return 'View expense information';
      default: return 'Create a new expense entry';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/95 to-blue-50/95 dark:from-gray-800/95 dark:to-gray-700/95 backdrop-blur-sm shadow-xl border-b border-blue-200 dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-all duration-300 hover:bg-blue-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl transform hover:scale-105"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to Expenses</span>
              </button>
              <div className="h-8 w-px bg-blue-300 dark:bg-gray-600 hidden sm:block"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h1>
                <p className="text-blue-600 dark:text-blue-400 mt-1 text-sm sm:text-base">{getSubtitle()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-200 dark:border-gray-600 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-800/50 dark:to-indigo-700/50 rounded-xl">
                <FileText className="h-6 w-6 text-blue-700 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 text-lg disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white"
                  placeholder="Enter a descriptive title for your expense"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">
                  <Calendar size={16} />
                  Expense Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400 z-10" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={mode === 'view'}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 text-lg disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">
                  <DollarSign size={16} />
                  Total Amount
                </label>
                <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-700/50 rounded-xl border-2 border-blue-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={mode === 'view'}
                  className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white"
                  rows="4"
                  placeholder="Add any additional details about this expense..."
                />
              </div>
            </div>
          </div>

          {/* Payments Section Card - Single Row Layout */}
          <div className="bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-200 dark:border-gray-600 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-indigo-100 to-blue-200 dark:from-indigo-800/50 dark:to-blue-700/50 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-700 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Payment Details
                </h2>
              </div>
              {mode !== 'view' && (
                <button
                  type="button"
                  onClick={addPaymentField}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Add Row
                </button>
              )}
            </div>

            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 mb-4 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-700/50 rounded-xl border-2 border-blue-200 dark:border-gray-600">
              <div className="col-span-3">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  <User size={14} />
                  Paid By
                </label>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  <Tag size={14} />
                  Main Category *
                </label>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  <Tag size={14} />
                  Sub Category
                </label>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  <DollarSign size={14} />
                  Amount *
                </label>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  <Receipt size={14} />
                  File/Receipt
                </label>
              </div>
              <div className="col-span-1">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  <Calculator size={14} />
                  Actions
                </label>
              </div>
            </div>

            {/* Payment Rows */}
            <div className="space-y-4">
              {formData.payments.map((payment, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-25 to-indigo-25 dark:from-gray-700/50 dark:to-gray-600/50 p-4 rounded-xl border-2 border-blue-150 dark:border-gray-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md">
                  
                  {/* Mobile Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                    {/* Paid By */}
                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                        <User size={14} />
                        Paid By *
                      </label>
                      <input
                        type="text"
                        required
                        value={payment.user}
                        onChange={(e) => handleUserInputChange(index, e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium"
                        placeholder="Enter name"
                      />
                      
                      {activeUserInput === index && filteredUsers.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                          {filteredUsers.map((user, userIndex) => (
                            <button
                              key={userIndex}
                              type="button"
                              onClick={() => selectUser(index, user)}
                              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none transition-all duration-200 border-b border-blue-100 dark:border-gray-700 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {user.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{user}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Main Category */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                        <Tag size={14} />
                        Main Category *
                      </label>
                      <select
                        required
                        value={payment.category}
                        onChange={(e) => updatePaymentField(index, 'category', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub Category */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                        <Tag size={14} />
                        Sub Category
                      </label>
                      <input
                        type="text"
                        value={payment.subCategory}
                        onChange={(e) => updatePaymentField(index, 'subCategory', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium"
                        placeholder="Sub category"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                        <DollarSign size={14} />
                        Amount *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" size={18} />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={payment.amount}
                          onChange={(e) => updatePaymentField(index, 'amount', e.target.value)}
                          disabled={mode === 'view'}
                          className="w-full pl-11 pr-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 font-bold text-lg bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* File Upload - Mobile */}
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">
                        <Receipt size={14} />
                        File/Receipt
                      </label>
                      
                      {mode === 'view' ? (
                        // View Mode - Show image preview or file info
                        <div>
                          {payment.existingFile?.hasFile ? (
                            <div className="p-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg">
                              {isImageFile(payment.existingFile.originalName) ? (
                                <div className="space-y-2">
                                  <img 
                                    src={getFilePreviewUrl(payment.existingFile)} 
                                    alt={payment.existingFile.originalName}
                                    className="w-full max-w-32 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="hidden items-center gap-2 text-blue-700 dark:text-blue-300" style={{display: 'none'}}>
                                    <File size={16} />
                                    <span className="text-sm truncate">{payment.existingFile.originalName}</span>
                                  </div>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    {payment.existingFile.originalName}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                  <File size={16} />
                                  <span className="text-sm truncate">{payment.existingFile.originalName}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">No file attached</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Edit/Add Mode - Show existing file handling and upload functionality
                        <div>
                          {/* Show existing file if available and not removed */}
                          {payment.existingFile?.hasFile && payment.fileAction !== 'remove' && !payment.file && (
                            <div className="mb-2 p-2 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg">
                              <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
                                <div className="flex items-center gap-2">
                                  <File size={14} />
                                  <span className="truncate">{payment.existingFile.originalName}</span>
                                  <span className="text-xs bg-blue-100 dark:bg-gray-600 px-2 py-1 rounded">Current</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleFileRemove(index, 'existing')}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove current file"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Show new file if selected */}
                          {payment.file && (
                            <div className="mb-2 p-2 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg">
                              <div className="flex items-center justify-between text-sm text-green-700 dark:text-green-300">
                                <div className="flex items-center gap-2">
                                  <File size={14} />
                                  <span className="truncate">{payment.file.name}</span>
                                  <span className="text-xs bg-green-100 dark:bg-gray-600 px-2 py-1 rounded">New</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleFileRemove(index, 'new')}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove new file"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div className="relative">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleFileUpload(index, file);
                                  e.target.value = '';
                                }
                              }}
                              className="hidden"
                              id={`file-upload-mobile-${index}`}
                            />
                            <label
                              htmlFor={`file-upload-mobile-${index}`}
                              className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 cursor-pointer bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600"
                            >
                              {payment.file ? (
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                                  <Upload size={16} />
                                  <span>Replace Selected File</span>
                                </div>
                              ) : (payment.existingFile?.hasFile && payment.fileAction !== 'remove') ? (
                                <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-medium">
                                  <Upload size={16} />
                                  <span>Replace Current File</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-medium">
                                  <Upload size={16} />
                                  <span>Upload File</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions - Full width on mobile */}
                    <div className="sm:col-span-2 flex items-center justify-center gap-3">
                      {mode !== 'view' && (
                        <>
                          <button
                            type="button"
                            onClick={addPaymentField}
                            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Add row"
                          >
                            <Plus size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePaymentField(index)}
                            disabled={formData.payments.length === 1}
                            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl disabled:hover:scale-100"
                            title="Remove row"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-end">
                    {/* Paid By Column */}
                    <div className="col-span-3 relative">
                      <input
                        type="text"
                        required
                        value={payment.user}
                        onChange={(e) => handleUserInputChange(index, e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium"
                        placeholder="Enter name"
                      />
                      
                      {activeUserInput === index && filteredUsers.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                          {filteredUsers.map((user, userIndex) => (
                            <button
                              key={userIndex}
                              type="button"
                              onClick={() => selectUser(index, user)}
                              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none transition-all duration-200 border-b border-blue-100 dark:border-gray-700 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {user.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{user}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Main Category Column */}
                    <div className="col-span-2">
                      <select
                        required
                        value={payment.category}
                        onChange={(e) => updatePaymentField(index, 'category', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium"
                      >
                        <option value="">Select</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub Category Column */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={payment.subCategory}
                        onChange={(e) => updatePaymentField(index, 'subCategory', e.target.value)}
                        disabled={mode === 'view'}
                        className="w-full px-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium"
                        placeholder="Sub category"
                      />
                    </div>
                    
                    {/* Amount Column */}
                    <div className="col-span-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" size={18} />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={payment.amount}
                          onChange={(e) => updatePaymentField(index, 'amount', e.target.value)}
                          disabled={mode === 'view'}
                          className="w-full pl-11 pr-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-lg focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 disabled:bg-blue-50 disabled:text-blue-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 font-bold bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* File Upload Column */}
                    <div className="col-span-2">
                      {mode === 'view' ? (
                        // View Mode - Show image preview or file info
                        <div>
                          {payment.existingFile?.hasFile ? (
                            <div className="p-2 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg">
                              {isImageFile(payment.existingFile.originalName) ? (
                                <div className="space-y-1">
                                  <img 
                                    src={getFilePreviewUrl(payment.existingFile)} 
                                    alt={payment.existingFile.originalName}
                                    className="w-16 h-12 object-cover rounded border border-gray-300 dark:border-gray-600 mx-auto"
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                  <div className="hidden items-center justify-center gap-1 text-blue-700 dark:text-blue-300" style={{display: 'none'}}>
                                    <File size={12} />
                                    <span className="text-xs">File</span>
                                  </div>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 text-center truncate" title={payment.existingFile.originalName}>
                                    {payment.existingFile.originalName}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-blue-700 dark:text-blue-300">
                                  <File size={16} />
                                  <span className="text-xs text-center truncate max-w-full" title={payment.existingFile.originalName}>
                                    {payment.existingFile.originalName}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">No file</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Edit/Add Mode - Show existing functionality
                        <div>
                          {/* Show existing file if available and not removed */}
                          {payment.existingFile?.hasFile && payment.fileAction !== 'remove' && !payment.file && (
                            <div className="mb-1 p-1 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded text-xs">
                              <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
                                <div className="flex items-center gap-1">
                                  <File size={12} />
                                  <span className="truncate max-w-16">{payment.existingFile.originalName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleFileRemove(index, 'existing')}
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Show new file if selected */}
                          {payment.file && (
                            <div className="mb-1 p-1 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded text-xs">
                              <div className="flex items-center justify-between text-green-700 dark:text-green-300">
                                <div className="flex items-center gap-1">
                                  <File size={12} />
                                  <span className="truncate max-w-16">{payment.file.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleFileRemove(index, 'new')}
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div className="relative">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleFileUpload(index, file);
                                  e.target.value = '';
                                }
                              }}
                              className="hidden"
                              id={`file-upload-${index}`}
                            />
                            <label
                              htmlFor={`file-upload-${index}`}
                              className="w-full flex items-center justify-center px-3 py-3 border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 cursor-pointer bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600"
                            >
                              {payment.file ? (
                                <div className="flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                                  <Upload size={14} />
                                  <span className="text-xs">Replace</span>
                                </div>
                              ) : (payment.existingFile?.hasFile && payment.fileAction !== 'remove') ? (
                                <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 font-medium">
                                  <Upload size={14} />
                                  <span className="text-xs">Replace</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 font-medium">
                                  <Upload size={14} />
                                  <span className="text-xs">Upload</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions Column */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      {mode !== 'view' && (
                        <>
                          <button
                            type="button"
                            onClick={addPaymentField}
                            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Add row"
                          >
                            <Plus size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePaymentField(index)}
                            disabled={formData.payments.length === 1}
                            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl disabled:hover:scale-100"
                            title="Remove row"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount Display */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 rounded-2xl text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Calculator className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">Total Expense Amount</p>
                    <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-blue-100 dark:text-blue-200 text-sm mb-1">
                    {formData.payments.length} payment{formData.payments.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-200">Live calculation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
        {mode !== 'view' && (
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-8 py-4 border-2 border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 font-bold transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:via-indigo-600 dark:hover:to-purple-600 text-white rounded-xl font-bold disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <Save size={20} />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  mode === 'add' ? 'Create Expense' : 'Update Expense'
                )}
              </button>
            </div>
          )}

          {mode === 'view' && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleBack}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Back to Expenses
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddExpensePage;