const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Tạo mảng các trang cần hiển thị
  if (totalPages <= 5) {
    // Nếu tổng số trang <= 5, hiển thị tất cả
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Nếu tổng số trang > 5, hiển thị có chọn lọc
    if (currentPage <= 3) {
      // Nếu đang ở gần đầu
      pages.push(1, 2, 3, 4, 5);
    } else if (currentPage >= totalPages - 2) {
      // Nếu đang ở gần cuối
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu đang ở giữa
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }
  }
  
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center -space-x-px">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          &laquo; Trước
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 leading-tight border ${
              currentPage === page
                ? "text-blue-600 bg-blue-50 border-blue-300"
                : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Tiếp &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;