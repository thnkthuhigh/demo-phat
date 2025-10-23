import { Link, useLocation } from "react-router-dom";

const AdminBreadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const breadcrumbNames = {
    'admin': 'Quản trị',
    'cases': 'Hoàn cảnh',
    'pending': 'Chờ duyệt',
    'supports': 'Ủng hộ',
    'history': 'Lịch sử',
    'users': 'Người dùng'
  };

  const breadcrumbs = [
    { name: 'Trang chủ', path: '/' },
    ...pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      return {
        name: breadcrumbNames[name] || name,
        path: routeTo
      };
    })
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumb;