import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Edit, 


  Eye, 
  Trash2, 
  Search,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  File,
  Download,
  Sparkles,
  Filter,
  X,
  FileText,
  Image,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSubscription } from '../../../contexts/SubscriptionContext';
import UsageLimitWarning from '../../../shared/components/UsageLimitWarning';
import UpgradeModal from '../../../shared/components/UpgradeModal';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTenant } from '../../../contexts/TenantContext';
import api from '../../../config/api'; 

// Line 32: Update API_URL
const API_URL =  'https://rbac-dashboard-2.onrender.com';

console.log('🌐 API_URL:', API_URL); // Add this for debugging

// const API_URL = 'http://localhost:5000'; 

// Mobile-optimized File Viewer Modal
// Fixed FileViewerModal Component - Replace the existing one in ExpensesPage.js

// Fixed FileViewerModal Component - Replace in ExpensesPage.js

// Fixed FileViewerModal Component - Replace in ExpensesPage.js

const FileViewerModal = ({ isOpen, onClose, file, expenseId, paymentIndex }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isImage = file?.mimetype?.startsWith('image/');
  const isPDF = file?.mimetype === 'application/pdf';
  
  // Stable file URL generation
  const fileUrl = useMemo(() => {
    if (expenseId && paymentIndex !== null && paymentIndex !== undefined) {
      return `${API_URL}/api/expenses/${expenseId}/files/${paymentIndex}`;
    }
    return null;
  }, [expenseId, paymentIndex]);

 // Line 62: Update getAuthHeaders function
const getAuthHeaders = useCallback(() => {
  // ✅ FIX: Get token correctly
  const token = localStorage.getItem('tenantToken') || localStorage.getItem('token');
  
  console.log('🔐 Getting auth headers:', {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE'
  });
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
}, []);

  // Stable image loading function
  const loadAuthenticatedImage = useCallback(async () => {
    if (!fileUrl || !isImage) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('===========================================');
      console.log('🔵 FRONTEND: Loading image from:', fileUrl);
      console.log('🔑 Auth token present:', !!localStorage.getItem('token'));

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get('content-type');
        const errorBody = await response.text();
        console.error('❌ Response not OK');
        console.error('   Status:', response.status);
        console.error('   Content-Type:', contentType);
        console.error('   Body preview:', errorBody.substring(0, 500));
        
        // Try to parse as JSON
        try {
          const errorJson = JSON.parse(errorBody);
          console.error('   Parsed error:', errorJson);
          throw new Error(errorJson.message || `HTTP ${response.status}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      
      if (!contentType || !contentType.startsWith('image/')) {
        // If we got HTML, the route might not exist or auth failed
        const responseText = await response.text();
        console.error('❌ Expected image but got:', contentType);
        console.error('❌ Response preview:', responseText.substring(0, 500));
        console.error('❌ Full URL:', fileUrl);
        console.error('===========================================');
        
        if (contentType?.includes('application/json')) {
          try {
            const jsonData = JSON.parse(responseText);
            throw new Error(jsonData.message || 'Invalid response type');
          } catch {
            // not JSON
          }
        }
        
        if (contentType?.includes('text/html')) {
          throw new Error('Route not found or authentication failed. Check backend logs.');
        }
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const blob = await response.blob();
      
      // Validate blob
      if (blob.size === 0) {
        throw new Error('Empty image data received');
      }

      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      console.log('✅ Image loaded successfully, blob size:', blob.size);
      console.log('===========================================');
    } catch (error) {
      console.error('❌ Image load error:', error);
      console.error('===========================================');
      setError(error.message || 'Failed to load image preview');
    } finally {
      setLoading(false);
    }
  }, [fileUrl, isImage, getAuthHeaders]);

  // Load image when modal opens
  useEffect(() => {
    if (isOpen && isImage && fileUrl && !imageUrl && !loading) {
      loadAuthenticatedImage();
    }
  }, [isOpen, isImage, fileUrl, imageUrl, loading, loadAuthenticatedImage]);

  // Cleanup when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (imageUrl) {
        console.log('🧹 Cleaning up image URL');
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(null);
      setError(null);
      setImageLoaded(false);
      setLoading(false);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen || !file) return null;

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${fileUrl}?download=true`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.originalName || file.filename || 'download';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup after a short delay
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
      
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    try {
      setLoading(true);
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to load file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('View error:', error);
      setError('Failed to open file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const ImagePreview = () => {
    if (error) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-4 sm:p-8">
          <FileText size={32} className="mx-auto mb-4 opacity-50 sm:w-12 sm:h-12" />
          <p className="text-red-600 dark:text-red-400 mb-2 text-sm font-semibold">Unable to display image preview</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            Try Downloading Instead
          </button>
        </div>
      );
    }

    if (!imageUrl || loading) {
      return (
        <div className="text-center p-4 sm:p-8">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading image preview...</p>
        </div>
      );
    }

    return (
      <div className="text-center p-2 relative">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={file.originalName || file.filename}
          className={`max-w-full max-h-64 sm:max-h-96 mx-auto rounded-lg shadow-lg transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ maxHeight: window.innerWidth < 640 ? '250px' : '400px', objectFit: 'contain' }}
          onLoad={() => {
            console.log('✅ Image rendered successfully');
            setImageLoaded(true);
          }}
          onError={(e) => {
            console.error('❌ Image render error:', e);
            setError('Failed to render image. The file may be corrupted.');
            setImageLoaded(false);
          }}
        />
      </div>
    );
  };

  const PDFPreview = () => (
    <div className="text-center text-gray-500 dark:text-gray-400 p-4 sm:p-8">
      <FileText size={40} className="mx-auto mb-4 opacity-50 sm:w-16 sm:h-16" />
      <h4 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">PDF Document</h4>
      <p className="mb-4 text-sm sm:text-base break-words">{file.originalName || file.filename}</p>
      <p className="text-xs sm:text-sm mb-6">PDF files cannot be previewed inline. Click "View" to open in a new tab or "Download" to save the file</p>
    </div>
  );

  const DocumentPreview = () => (
    <div className="text-center text-gray-500 dark:text-gray-400 p-4 sm:p-8">
      <FileText size={40} className="mx-auto mb-4 opacity-50 sm:w-16 sm:h-16" />
      <h4 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Document File</h4>
      <p className="mb-4 text-sm sm:text-base break-words">{file.originalName || file.filename}</p>
      <p className="text-xs sm:text-sm mb-6">
        {file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'Word Document' :
         file.mimetype === 'application/vnd.ms-excel' ? 'Excel Spreadsheet' :
         file.mimetype === 'text/plain' ? 'Text File' : 'Document File'}
      </p>
      <p className="text-xs sm:text-sm mb-6">Click "Download" to save this file to your device</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 border-b border-blue-200 dark:border-gray-600">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
            {isImage ? <Image size={20} className="text-blue-600 dark:text-blue-400 sm:w-6 sm:h-6" /> : 
             isPDF ? <FileText size={20} className="text-red-600 dark:text-red-400 sm:w-6 sm:h-6" /> : 
             <FileText size={20} className="text-gray-600 dark:text-gray-400 sm:w-6 sm:h-6" />}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                {file.originalName || file.filename}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {file.mimetype} • {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {!isImage && (
              <button
                onClick={handleView}
                disabled={loading}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-400 text-white rounded-lg transition-colors text-xs sm:text-sm"
                title="Open in new tab"
              >
                <Eye size={14} />
                <span className="hidden xs:inline">{loading ? 'Loading...' : 'View'}</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:bg-green-400 dark:disabled:bg-green-400 text-white rounded-lg transition-colors text-xs sm:text-sm"
              title="Download file"
            >
              <Download size={14} />
              <span className="hidden xs:inline">{loading ? 'Downloading...' : 'Download'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X size={16} className="text-gray-600 dark:text-gray-400 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-auto max-h-[70vh] sm:max-h-[60vh] relative">
          {isImage ? (
            <ImagePreview />
          ) : isPDF ? (
            <PDFPreview />
          ) : (
            <DocumentPreview />
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized Expense Card Component
// Enhanced Mobile-optimized Expense Card Component
const ExpenseCard = ({ expense, onView, onEdit, onDelete, onFileView, formatCurrency, formatDate }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Helper function to truncate description
  const truncateText = (text, maxLength = 300) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
  };

  const shouldShowReadMore = expense.description && expense.description.length > 300;

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-lg border border-blue-200 dark:border-gray-600 mb-4 overflow-hidden">
      {/* Card Header - Always visible */}
      <div className="p-4 border-b border-blue-100 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 truncate mb-1">
              {expense.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2">
              <Calendar size={14} />
              <span>{formatDate(expense.date || expense.createdAt)}</span>
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {formatCurrency(expense.totalAmount)}
            </div>
          </div>
          
          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => onView(expense)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg transition-all duration-200"
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onEdit(expense)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-lg transition-all duration-200"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(expense._id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-lg transition-all duration-200"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="flex items-center justify-between mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-700/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-600">
            {expense.category?.name || 'N/A'}
          </span>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span>{expanded ? 'Less' : 'More'}</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Description Section - Always visible when exists */}
      {expense.description && (
        <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Description</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {expanded ? expense.description : truncateText(expense.description)}
          </p>
          {shouldShowReadMore && !expanded && (
            <button
              onClick={() => onView(expense)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium mt-2 transition-colors"
            >
              Read more
            </button>
          )}
        </div>
      )}

      {/* Payment Details - Enhanced layout */}
      {expense.payments && expense.payments.length > 0 && (
        <div className="p-4 space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Payment Details</h4>
          
          {expense.payments.map((payment, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-3 border border-blue-100 dark:border-gray-600">
              {/* User info with avatar */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {payment.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 block">
                      {payment.user}
                    </span>
                    {payment.amount && (
                      <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        {formatCurrency(payment.amount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub Category and Files row */}
              <div className="flex items-center justify-between gap-2">
                {/* Sub Category */}
                <div className="flex-1">
                  {payment.subCategory && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800/50 dark:to-pink-700/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-600">
                        {payment.subCategory}
                      </span>
                    </div>
                  )}
                </div>

                {/* File button */}
                {payment.file && (
                  <button
                    onClick={() => onFileView(expense, index)}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-700/50 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-700/60 dark:hover:to-emerald-600/60 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium transition-all duration-200 border border-green-200 dark:border-green-600"
                    title={`View file: ${payment.file.originalName || payment.file.filename}`}
                  >
                    <File size={14} />
                    <Eye size={14} />
                    <span className="text-xs">
                      {payment.file.originalName?.substring(0, 8) || 'File'}
                      {(payment.file.originalName?.length || 0) > 8 ? '...' : ''}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Additional Details when expanded */}
      {expanded && (
        <div className="px-4 pb-4 bg-blue-50/30 dark:bg-gray-700/20">
          {/* Show more payment details or other expanded content */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <strong>Created:</strong> {formatDate(expense.createdAt)}
            {expense.status && (
              <>
                <span className="mx-2">•</span>
                <strong>Status:</strong> 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-bold ${
                  expense.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' 
                    : expense.status === 'approved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTenant(); // ✅ ADD THIS
  const { slug } = useParams(); // ✅ ADD THIS
  
  // ✅ ADD THIS - Get current slug
  const currentSlug = slug || tenant?.slug;
   const { checkLimit } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const expenseLimit = checkLimit('expense');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(window.innerWidth < 768 ? 10 : 5); // More items per page on mobile
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'cards' : 'table'); // Default to cards on mobile
  const [filtersVisible, setFiltersVisible] = useState(false);
 const [statistics, setStatistics] = useState({
  totalExpenses: 0,
  totalAmount: 0,
  monthlyExpenses: 0,
  pendingExpenses: 0
});


  // File viewer state
  const [fileViewer, setFileViewer] = useState({
    isOpen: false,
    file: null,
    expenseId: null,
    paymentIndex: null
  });



const loadExpenses = useCallback(async () => {
  try {
    setLoading(true);
    
    const result = await api.get('/api/expenses?limit=100').catch(() =>
      api.get('/api/expenses')
    );

    // console.log('📊 Full API Response:', result);
    
    const expensesData = result.data?.data || result.data || [];
    
    if (!Array.isArray(expensesData)) {
      console.error('❌ expensesData is not an array:', expensesData);
      setExpenses([]);
      return;
    }
    
    setExpenses(expensesData);
    console.log('✅ Expenses set in state:', expensesData.length);
    
  } catch (error) {
    console.error('❌ Error loading expenses:', error);
    setExpenses([]);
  } finally {
    setLoading(false);
  }
}, []);

// ============================================
// LOAD CATEGORIES FUNCTION
// ============================================
const loadCategories = useCallback(async () => {
  try {
    console.log('🔵 Starting to load categories...');
    
    // Try the simple endpoint first, fallback to full endpoint
    const result = await api.get('/api/categories/simple').catch(() => {
      console.log('⚠️ Simple endpoint failed, trying full endpoint...');
      return api.get('/api/categories?limit=100');
    });

    console.log('📦 Categories API Raw Response:', result);
    console.log('📦 Categories result.data:', result.data);
    console.log('📦 Is result.data an array?', Array.isArray(result.data));

    // Handle different response formats
    let categoriesData = [];
    
    if (Array.isArray(result.data)) {
      // Format 1: Direct array response
      categoriesData = result.data;
      console.log('✅ Format 1: Direct array detected');
    } else if (result.data && Array.isArray(result.data.categories)) {
      // Format 2: Nested in categories property
      categoriesData = result.data.categories;
      console.log('✅ Format 2: Nested categories array detected');
    } else if (result.data && Array.isArray(result.data.data)) {
      // Format 3: Nested in data property
      categoriesData = result.data.data;
      console.log('✅ Format 3: Nested data array detected');
    } else {
      console.log('⚠️ Unknown format, using empty array');
      categoriesData = [];
    }

    console.log('📊 Final categories count:', categoriesData.length);
    console.log('📊 Categories data:', categoriesData);

    // Always ensure we have an array with at least default values
    if (categoriesData.length === 0) {
      console.log('⚠️ No categories returned, using default fallback');
      categoriesData = [
        { _id: 'default-1', name: 'Food' },
        { _id: 'default-2', name: 'Transportation' },
        { _id: 'default-3', name: 'Utilities' },
        { _id: 'default-4', name: 'General' }
      ];
    }

    setCategories(categoriesData);
    console.log('✅ Categories loaded successfully:', categoriesData.length, 'items');
    
  } catch (error) {
    console.error('❌ Error loading categories:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Set fallback categories on error
    const fallbackCategories = [
      { _id: 'fallback-1', name: 'Food' },
      { _id: 'fallback-2', name: 'Transportation' },
      { _id: 'fallback-3', name: 'Utilities' },
      { _id: 'fallback-4', name: 'General' }
    ];
    
    setCategories(fallbackCategories);
    console.log('✅ Fallback categories set:', fallbackCategories.length, 'items');
  }
}, []); // No dependencies needed

 // Calculate local statistics from expenses
const calculateLocalStatistics = useCallback(() => {
  if (expenses.length === 0) {
    return {
      totalExpenses: 0,
      totalAmount: 0,
      monthlyExpenses: 0,
      pendingExpenses: 0
    };
  }

  const total = expenses.reduce((sum, expense) => sum + (expense.totalAmount || 0), 0);
  const pending = expenses.filter(exp => exp.status === 'pending').length;
  
  const now = new Date();
  const thisMonth = expenses.filter(exp => {
    const expDate = new Date(exp.date || exp.createdAt);
    return expDate.getMonth() === now.getMonth() && 
           expDate.getFullYear() === now.getFullYear();
  }).length;

  return {
    totalExpenses: expenses.length,
    totalAmount: total,
    monthlyExpenses: thisMonth,
    pendingExpenses: pending
  };
}, [expenses]);
// ============================================
// LOAD STATISTICS FUNCTION
// ============================================
const loadStatistics = useCallback(async () => {
  // Always calculate from local expenses first
  if (expenses.length > 0) {
    const localStats = calculateLocalStatistics();
    setStatistics(localStats);
  }

  // Skip API call for now since it's returning incorrect data
  // The local calculation is accurate and doesn't cause blinking
  
  /* Commented out API call - uncomment when backend is fixed
  try {
    setStatsLoading(true);
    console.log('📊 Loading statistics from API...');
    
    const result = await api.get('/api/expenses/statistics');
    // ... rest of API logic
  } catch (error) {
    console.error('❌ Error loading statistics:', error);
  } finally {
    setStatsLoading(false);
  }
  */
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [expenses.length, calculateLocalStatistics]);


// ============================================
// USAGE EXAMPLE IN COMPONENT
// ============================================
// Place these inside your ExpensesPage component:

// 1. Load initial data
useEffect(() => {
  console.log('🚀 Component mounted, loading data...');
  loadExpenses();
  loadCategories();
  // Don't load statistics yet - wait for expenses to load first
}, [loadExpenses, loadCategories]);

// 2. Load statistics AFTER expenses are loaded
// 2. Load statistics AFTER expenses are loaded
useEffect(() => {
  if (expenses.length > 0) {
    console.log('📊 Expenses loaded, calculating statistics...');
    const localStats = calculateLocalStatistics();
    setStatistics(localStats);
    
    // Then load from API (but local stats are already showing)
    loadStatistics();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [expenses.length]); // Only trigger when expenses count changes

// Debug helper - remove after fixing
useEffect(() => {
  console.log('🔍 Current categories state:', categories);
  console.log('🔍 Is categories an array?', Array.isArray(categories));
  console.log('🔍 Categories length:', categories?.length);
}, [categories]);

useEffect(() => {
  console.log('🔍 Current statistics state:', statistics);
}, [statistics]);

   useEffect(() => {
    console.log('🔍 DEBUG INFO:');
    console.log('   API_URL:', API_URL);
    console.log('   tenantToken:', localStorage.getItem('tenantToken')?.substring(0, 20));
    console.log('   token:', localStorage.getItem('token')?.substring(0, 20));
    console.log('   currentSlug:', currentSlug);
  }, [currentSlug]);

  // Handle window resize for responsive view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'table') {
        setViewMode('cards');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Load all data on component mount
  // useEffect(() => {
  //   loadExpenses();
  //   loadCategories();
  //   loadStatistics();
  // }, [loadExpenses, loadCategories, loadStatistics]);

useEffect(() => {
  if (location.state?.refreshExpenses) {
    loadExpenses();
    window.history.replaceState({}, document.title);
  }
}, [location.state, loadExpenses]);


  // Recalculate statistics when expenses change
  // useEffect(() => {
  //   if (expenses.length > 0) {
  //     calculateLocalStatistics();
  //   }
  // }, [expenses, calculateLocalStatistics]);

 const handleAddExpense = () => {
  // Check limit
  if (!expenseLimit.canUse) {
    toast.error('Monthly expense limit reached. Please upgrade your plan.');
    setShowUpgradeModal(true);
    return;
  }
  
  navigate(`/tenant/${currentSlug}/add-expense`);
};

 // Around line 638: Update handleEditExpense
const handleEditExpense = (expense) => {
  console.log('✏️ Editing expense:', expense._id);
  console.log('📦 Expense data:', expense);
  
  navigate(`/tenant/${currentSlug}/add-expense`, { 
    state: { 
      expense: expense,  // ✅ Pass full expense object
      mode: 'edit' 
    } 
  });
};

// Around line 643: Update handleViewExpense
const handleViewExpense = (expense) => {
  console.log('👁️ Viewing expense:', expense._id);
  console.log('📦 Expense data:', expense);
  
  navigate(`/tenant/${currentSlug}/add-expense`, { 
    state: { 
      expense: expense,  // ✅ Pass full expense object
      mode: 'view' 
    } 
  });
};

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      setLoading(true);
    await api.delete(`/api/expenses/${expenseId}`);
setExpenses(expenses.filter(exp => exp._id !== expenseId));
alert('Expense deleted successfully');
return; // Exit early on success

      // if (!response.ok) {
      //   throw new Error('Failed to delete expense');
      // }

      // setExpenses(expenses.filter(exp => exp._id !== expenseId));
      // alert('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // File viewer handlers
  const handleFileView = (expense, paymentIndex) => {
    const payment = expense.payments[paymentIndex];
    if (payment?.file) {
      setFileViewer({
        isOpen: true,
        file: payment.file,
        expenseId: expense._id,
        paymentIndex: paymentIndex
      });
    }
  };

  const closeFileViewer = () => {
    setFileViewer({
      isOpen: false,
      file: null,
      expenseId: null,
      paymentIndex: null
    });
  };

  // Enhanced filtering
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || expense.category?._id === selectedCategory;
    
    const matchesDate = !dateFilter || new Date(expense.date || expense.createdAt).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setDateFilter('');
    setCurrentPage(1);
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 sm:mt-6 text-blue-600 dark:text-blue-400 text-base sm:text-lg font-medium">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-Optimized Header */}
        <div className="bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 border border-blue-200 dark:border-gray-600 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                <div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
                    Expense Dashboard
                  </h1>
                  <p className="text-blue-600 dark:text-blue-400 text-sm sm:text-base lg:text-lg font-medium hidden sm:block">
                    Track and manage all your expenses efficiently
                  </p>
                </div>
              </div>
              
              {/* Mobile Add Button */}
              <button
                onClick={handleAddExpense}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:via-indigo-600 dark:hover:to-purple-600 text-white px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Add</span>
                <span className="hidden sm:inline">New Expense</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
          <div className="bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-xl border border-blue-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-800/50 dark:to-indigo-700/50 rounded-xl mb-2 sm:mb-0 self-start">
                <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-blue-700 dark:text-blue-400" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Total</p>
                <p className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{statistics.totalExpenses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white/95 to-green-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-xl border border-green-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-800/50 dark:to-emerald-700/50 rounded-xl mb-2 sm:mb-0 self-start">
                <DollarSign className="h-5 w-5 sm:h-8 sm:w-8 text-green-700 dark:text-green-400" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">Amount</p>
                <p className="text-sm sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {window.innerWidth < 640 ? `${(statistics.totalAmount / 1000).toFixed(1)}K` : formatCurrency(statistics.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/95 to-purple-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-xl border border-purple-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-100 to-violet-200 dark:from-purple-800/50 dark:to-violet-700/50 rounded-xl mb-2 sm:mb-0 self-start">
                <Calendar className="h-5 w-5 sm:h-8 sm:w-8 text-purple-700 dark:text-purple-400" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">Monthly</p>
                <p className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">{statistics.monthlyExpenses}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/95 to-orange-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-100 to-amber-200 dark:from-orange-800/50 dark:to-amber-700/50 rounded-xl mb-2 sm:mb-0 self-start">
                <Users className="h-5 w-5 sm:h-8 sm:w-8 text-orange-700 dark:text-orange-400" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider">Pending</p>
                <p className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">{statistics.pendingExpenses}</p>
              </div>
            </div>
          </div>
        </div>
{expenseLimit.percentage > 75 && (
  <div className="mb-4">
    <UsageLimitWarning
      feature="expense"
      current={expenseLimit.current}
      limit={expenseLimit.limit}
      percentage={expenseLimit.percentage}
      onUpgrade={() => setShowUpgradeModal(true)}
    />
  </div>
)}
        {/* Mobile-Optimized Search and Filters */}
        <div className="bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 dark:border-gray-600 mb-4 sm:mb-8">
          <div className="p-4 sm:p-6">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" size={20} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium text-sm sm:text-base"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors md:hidden"
              >
                <Filter size={20} />
                <span className="font-medium">Filters</span>
                {filtersVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* View Mode Toggle for larger screens */}
              <div className="hidden md:flex items-center gap-2 bg-blue-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'cards' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {/* Collapsible Filters */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 overflow-hidden ${
              filtersVisible || window.innerWidth >= 768 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100'
            }`}>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" size={18} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium text-sm sm:text-base"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" size={18} />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800/50 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-25 dark:from-gray-700 dark:to-gray-600 dark:text-white font-medium text-sm sm:text-base"
                />
              </div>
            </div>

            {(searchTerm || selectedCategory || dateFilter) && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200 dark:border-gray-600">
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Showing {filteredExpenses.length} of {expenses.length} expenses
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Loading Indicator */}
        {loading && expenses.length > 0 && (
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl mb-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <p className="text-blue-700 dark:text-blue-400 text-sm font-bold">Updating...</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {paginatedExpenses.length === 0 ? (
          <div className="bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 dark:border-gray-600 p-8 sm:p-16 text-center">
            <div className="text-blue-600 dark:text-blue-400">
              <TrendingUp size={48} className="mx-auto mb-6 opacity-30 sm:w-16 sm:h-16" />
              <p className="text-xl sm:text-2xl font-bold mb-2">No expenses found</p>
              <p className="text-sm sm:text-lg mb-6">Get started by adding your first expense</p>
              <button
                onClick={handleAddExpense}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:via-indigo-600 dark:hover:to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Add Your First Expense
              </button>
            </div>
          </div>
        ) : viewMode === 'cards' || window.innerWidth < 768 ? (
          // Mobile Card View
          <div className="space-y-4">
            {paginatedExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                onView={handleViewExpense}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                onFileView={handleFileView}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
      // Desktop Table View with text truncation
<div className="bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-200 dark:border-gray-600">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 border-b-2 border-blue-200 dark:border-gray-600">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Title & Date</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Category</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Sub Category</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Amount</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Paid By</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Files</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white/60 dark:bg-gray-800/60 divide-y divide-blue-100 dark:divide-gray-600">
        {paginatedExpenses.map((expense) => {
          // Helper functions for truncation in table
          const truncateTitle = (text, maxLength = 50) => {
            if (!text) return '';
            return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
          };

          const truncateDescription = (text, maxLength = 100) => {
            if (!text) return '';
            return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
          };

          const shouldShowTitleReadMore = expense.title && expense.title.length > 50;
          const shouldShowDescReadMore = expense.description && expense.description.length > 100;

          return (
            <tr key={expense._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
              <td className="px-6 py-4">
                <div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-1">
                    {truncateTitle(expense.title)}
                    {shouldShowTitleReadMore && (
                      <button
                        onClick={() => handleViewExpense(expense)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium ml-2 transition-colors"
                      >
                        more
                      </button>
                    )}
                  </div>
                  
                  {expense.description && (
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      {truncateDescription(expense.description)}
                      {shouldShowDescReadMore && (
                        <button
                          onClick={() => handleViewExpense(expense)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium ml-2 transition-colors"
                        >
                          read more
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar size={14} className="text-blue-500 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {formatDate(expense.date || expense.createdAt)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-700/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-600">
                  {expense.category?.name || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {expense.payments && expense.payments.length > 0 ? (
                    expense.payments.map((payment, index) => (
                      payment.subCategory ? (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800/50 dark:to-pink-700/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-600 mr-1 mb-1"
                        >
                          {payment.subCategory}
                        </span>
                      ) : null
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">N/A</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {formatCurrency(expense.totalAmount)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {expense.payments && expense.payments.length > 0 ? (
                    expense.payments.map((payment, index) => (
                      <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {payment.user.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          {payment.user}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No payments</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {expense.payments && expense.payments.some(p => p.file) ? (
                    expense.payments.map((payment, index) => (
                      payment.file && (
                        <button
                          key={index}
                          onClick={() => handleFileView(expense, index)}
                          className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-700/50 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-700/60 dark:hover:to-emerald-600/60 text-green-800 dark:text-green-300 rounded-lg text-xs font-medium transition-all duration-200 border border-green-200 dark:border-green-600"
                          title={`View file: ${payment.file.originalName || payment.file.filename}`}
                        >
                          <File size={12} />
                          <Eye size={12} />
                          <span className="hidden lg:inline ml-1">
                            {payment.file.originalName?.substring(0, 10) || 'File'}
                            {(payment.file.originalName?.length || 0) > 10 ? '...' : ''}
                          </span>
                        </button>
                      )
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-xs">No files</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleViewExpense(expense)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div> 
        )}

        {/* Mobile-Optimized Pagination */}
        {paginatedExpenses.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-white/95 to-blue-50/90 dark:from-gray-800/95 dark:to-gray-700/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-blue-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="order-2 sm:order-1">
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 font-bold text-center sm:text-left">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length}
                </p>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-2 sm:px-3 py-2 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-300 font-medium text-sm"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </button>
                
                {/* Mobile-optimized page numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
                    const pages = [];
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    // Add first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                        >
                          1
                        </button>
                      );
                      
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className="px-1 sm:px-2 text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Add visible page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${
                            currentPage === i
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-lg'
                              : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Add last page and ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="px-1 sm:px-2 text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                            ...
                          </span>
                        );
                      }
                      
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-2 sm:px-3 py-2 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-300 font-medium text-sm"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={fileViewer.isOpen}
        onClose={closeFileViewer}
        file={fileViewer.file}
        expenseId={fileViewer.expenseId}
        paymentIndex={fileViewer.paymentIndex}
      />
      <UpgradeModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  currentPlan="free"
  limitType="expense"
/>
    </div>
  );
};

export default ExpensesPage;