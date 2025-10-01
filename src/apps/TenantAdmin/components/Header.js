import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  X,
  UserPlus,
  UserCheck,
  UserX,
  ShieldPlus,
  Shield,
  ShieldX,
  FolderPlus,
  Folder,
  FolderX,
  TrendingUp,
  Edit,
  Trash2,
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import api, { ENDPOINTS } from '../../../config/api';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications using the new API configuration
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const [notificationsRes, unreadRes] = await Promise.all([
        api.get(`${ENDPOINTS.ACTIVITIES.NOTIFICATIONS}?limit=10`),
        api.get(ENDPOINTS.ACTIVITIES.UNREAD_COUNT)
      ]);

      setNotifications(notificationsRes.data.data || []);
      setUnreadCount(unreadRes.data.data?.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set fallback data on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark notifications as read
  const markNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) return;

      await api.put(ENDPOINTS.ACTIVITIES.MARK_READ, {
        activityIds: unreadNotifications.map(n => n.id)
      });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Get icon component for activity type
  const getIconComponent = (iconName) => {
    const iconMap = {
      'UserPlus': UserPlus,
      'UserCheck': UserCheck,
      'UserX': UserX,
      'ShieldPlus': ShieldPlus,
      'Shield': Shield,
      'ShieldX': ShieldX,
      'FolderPlus': FolderPlus,
      'Folder': Folder,
      'FolderX': FolderX,
      'TrendingUp': TrendingUp,
      'Edit': Edit,
      'Trash2': Trash2,
      'Activity': Activity
    };
    return iconMap[iconName] || Activity;
  };

  // Fetch notifications on component mount and set up polling
  useEffect(() => {
    if (user && user._id) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Welcome Message - Responsive */}
          <div className="hidden xs:block min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              Welcome, {user?.name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && user) {
                  fetchNotifications();
                }
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative touch-manipulation"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold hidden sm:block">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markNotificationsAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="sm:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification, index) => {
                          const IconComponent = getIconComponent(notification.icon);
                          return (
                            <motion.div
                              key={notification.id || index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ${
                                  !notification.isRead ? 'ring-2 ring-blue-500' : ''
                                }`}>
                                  <IconComponent className={`w-4 h-4 ${notification.color || 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title || notification.message}
                                  </p>
                                  {notification.message && notification.title && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                      {notification.message}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {notification.time || 'Just now'}
                                      </span>
                                      {notification.performedBy && (
                                        <>
                                          <span className="text-gray-300">•</span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            by {notification.performedBy}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                  {notification.entityType && (
                                    <div className="mt-1">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {notification.entityType}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">All caught up!</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          No new notifications
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          // Navigate to full notifications page if you have one
                          // navigate('/notifications');
                        }}
                        className="w-full text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-yellow-500" />
              ) : (
                <Sun className="w-5 h-5 text-orange-500" />
              )}
            </motion.div>
          </button>

          {/* Profile Dropdown */}
          <div className="relative z-50" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
            >
              {/* Avatar */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              
              {/* User Info - Hidden on very small screens */}
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24 md:max-w-none">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role?.name}
                </p>
              </div>
              
              {/* Chevron - Hidden on mobile */}
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu - Mobile Optimized */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="py-2">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                          <p className="text-xs text-primary-600 dark:text-primary-400">
                            {user?.role?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>Profile Settings</span>
                      </button>
                      
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        <span>App Settings</span>
                      </button>
                      
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;