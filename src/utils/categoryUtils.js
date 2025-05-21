export const getCategoryLabel = (category) => {
  switch (category) {
    case "medical":
      return "Y tế";
    case "education":
      return "Giáo dục";
    case "disaster":
      return "Thiên tai";
    case "poverty":
      return "Xóa đói giảm nghèo";
    case "environment":
      return "Môi trường";
    case "community":
      return "Cộng đồng";
    case "children":
      return "Trẻ em";
    case "elderly":
      return "Người già";
    case "disability":
      return "Người khuyết tật";
    default:
      return "Khác";
  }
};

// Other category-related functions can be added here