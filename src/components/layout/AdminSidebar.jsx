import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({ collapsed, pendingSupports, pendingCases }) => {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Quản lý hoàn cảnh",
      path: "/admin/cases",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "Hoàn cảnh chờ duyệt",
      path: "/admin/cases/pending",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: pendingCases,
      badgeColor: "bg-yellow-500"
    },
    {
      title: "Quản lý ủng hộ",
      path: "/admin/supports",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: pendingSupports,
      badgeColor: "bg-red-500"
    },
    {
      title: "Lịch sử hỗ trợ",
      path: "/admin/history",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex-shrink-0 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            // Exact match for active state - no special logic
            const isActive = path === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 relative ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={collapsed ? item.title : undefined}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 relative ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {item.icon}
                  
                  {/* Collapsed Badge */}
                  {collapsed && item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {/* Title & Badge - Only show when not collapsed */}
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1">{item.title}</span>
                    {item.badge > 0 && (
                      <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;