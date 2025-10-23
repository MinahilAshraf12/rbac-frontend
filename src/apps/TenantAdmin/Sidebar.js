// src/apps/TenantAdmin/Sidebar.js - FIXED FOR SUBDOMAIN ROUTING
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Shield,
  FolderTree,
  ChevronRight,
  Receipt,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

const Sidebar = ({ isOpen, onToggle, onItemClick, tenantSlug }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { tenant } = useTenant();
  const { slug } = useParams();

  // ✅ Determine if we're on subdomain or path-based routing
  const hostname = window.location.hostname;
  const isSubdomain = hostname.endsWith('.i-expense.ikftech.com') && 
                      hostname !== 'i-expense.ikftech.com' &&
                      hostname !== 'admin.i-expense.ikftech.com';

  // Use slug from props, context, or params
  const currentSlug = tenantSlug || tenant?.slug || slug;

  console.log('🔗 Sidebar routing:', { 
    isSubdomain, 
    currentSlug, 
    hostname 
  });

  // ✅ FIXED: Build paths based on subdomain vs path-based routing
  const buildPath = (route) => {
    if (isSubdomain) {
      // On subdomain: just use relative paths
      return route;
    } else {
      // On main domain: use /tenant/:slug prefix
      return `/tenant/${currentSlug}${route}`;
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: buildPath('/dashboard'),
      permission: null,
      shortTitle: 'Home',
    },
    {
      title: 'Expenses',
      icon: Receipt,
      path: buildPath('/expenses'),
      permission: { resource: 'expenses', action: 'read' },
      shortTitle: 'Expenses',
    },
    {
      title: 'Add Expense',
      icon: Plus,
      path: buildPath('/add-expense'),
      permission: { resource: 'expenses', action: 'create' },
      shortTitle: 'Add',
      highlight: true,
    },
    {
      title: 'Users',
      icon: Users,
      path: buildPath('/users'),
      permission: { resource: 'users', action: 'read' },
      shortTitle: 'Users',
    },
    {
      title: 'Roles',
      icon: Shield,
      path: buildPath('/roles'),
      permission: { resource: 'roles', action: 'read' },
      shortTitle: 'Roles',
    },
    {
      title: 'Categories',
      icon: FolderTree,
      path: buildPath('/categories'),
      permission: { resource: 'categories', action: 'read' },
      shortTitle: 'Categories',
    },
    {
      title: 'Subscription',
      icon: Crown,
      path: buildPath('/subscription'),
      permission: null,
      shortTitle: 'Plan',
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission.resource, item.permission.action)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <SidebarContent
          menuItems={filteredMenuItems}
          location={location}
          isOpen={isOpen}
          onToggle={onToggle}
          onItemClick={onItemClick}
          tenantName={tenant?.name}
          isSubdomain={isSubdomain}
        />
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-2xl z-50"
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <SidebarContent
          menuItems={filteredMenuItems}
          location={location}
          isOpen={true}
          onToggle={onToggle}
          onItemClick={onItemClick}
          isMobile={true}
          tenantName={tenant?.name}
          isSubdomain={isSubdomain}
        />
      </motion.div>
    </>
  );
};

const SidebarContent = ({ 
  menuItems, 
  location, 
  isOpen, 
  onToggle, 
  onItemClick, 
  isMobile = false, 
  tenantName,
  isSubdomain 
}) => {
  const handleItemClick = () => {
    if (isMobile && onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                {tenantName || 'Workspace'}
              </h1>
              {isSubdomain && (
                <p className="text-xs text-gray-500">Subdomain Access</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onToggle(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}

      {/* Desktop Logo Section */}
      {!isMobile && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <motion.div
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {tenantName || 'Admin Panel'}
                </h1>
                {isSubdomain && (
                  <p className="text-xs text-gray-500">Subdomain</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className={`flex-1 ${isMobile ? 'p-3' : 'p-4'} space-y-1 overflow-y-auto`}>
        {/* Quick Actions for Mobile */}
        {isMobile && menuItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={menuItems.find(m => m.highlight)?.path || '#'}
                onClick={handleItemClick}
                className="flex flex-col items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30 touch-manipulation"
              >
                <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400 mb-1" />
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">Add Expense</span>
              </Link>
              <Link
                to={menuItems.find(m => m.title === 'Expenses')?.path || '#'}
                onClick={handleItemClick}
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
              >
                <Receipt className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">View All</span>
              </Link>
            </div>
          </div>
        )}

        {/* Main Menu */}
        <div className={isMobile ? 'mb-4' : ''}>
          {isMobile && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
              Menu
            </h3>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleItemClick}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group touch-manipulation ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg transform scale-[0.98]'
                    : isMobile
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                } ${item.highlight && !isActive ? 'ring-1 ring-primary-200 dark:ring-primary-800' : ''}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                {(isOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium flex-1 min-w-0"
                  >
                    {isMobile && item.shortTitle ? item.shortTitle : item.title}
                  </motion.span>
                )}
                {isActive && (isOpen || isMobile) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
                
                {isMobile && item.highlight && !isActive && (
                  <span className="ml-auto flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Footer */}
      {isMobile && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Made with ❤️ by ikFTech
            </p>
          </div>
        </div>
      )}

      {/* Desktop Toggle Button */}
      {!isMobile && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onToggle(!isOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;