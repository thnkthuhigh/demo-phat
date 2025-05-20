import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";

const CreateCaseScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  // Thêm supportType để xác định loại hỗ trợ
  const [supportType, setSupportType] = useState("money");
  const [targetAmount, setTargetAmount] = useState("");
  const [situationImages, setSituationImages] = useState([]);
  const [proofImages, setProofImages] = useState([]);
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [endDate, setEndDate] = useState("");

  // State cho vật phẩm
  const [items, setItems] = useState([
    {
      name: "",
      quantity: 1,
      unit: "cái",
    },
  ]);

  // State cho uploading
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // State cho form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [navigate, userInfo]);

  // Hàm thêm vật phẩm mới
  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unit: "cái" }]);
  };

  // Hàm xóa vật phẩm
  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(
      newItems.length ? newItems : [{ name: "", quantity: 1, unit: "cái" }]
    );
  };

  // Hàm cập nhật thông tin vật phẩm
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "quantity" ? Number(value) : value;
    setItems(newItems);
  };

  // Hàm xử lý upload hình ảnh
  const uploadFileHandler = async (e, type) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setUploading(true);
      setUploadError(null);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post("/api/upload", formData, config);

      if (type === "situation") {
        setSituationImages([...situationImages, ...data]);
      } else {
        setProofImages([...proofImages, ...data]);
      }

      setUploading(false);
    } catch (error) {
      setUploadError("Lỗi khi tải lên hình ảnh");
      setUploading(false);
    }
  };

  // Xóa hình ảnh
  const removeImage = (index, type) => {
    if (type === "situation") {
      const newImages = [...situationImages];
      newImages.splice(index, 1);
      setSituationImages(newImages);
    } else {
      const newImages = [...proofImages];
      newImages.splice(index, 1);
      setProofImages(newImages);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title || !description || !category || !supportType) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (
      (supportType === "money" || supportType === "both") &&
      (!targetAmount || targetAmount <= 0)
    ) {
      setError("Vui lòng nhập số tiền mục tiêu hợp lệ");
      return;
    }

    if (
      (supportType === "items" || supportType === "both") &&
      (!items[0].name || items.some((item) => !item.name || item.quantity <= 0))
    ) {
      setError("Vui lòng nhập thông tin vật phẩm cần hỗ trợ");
      return;
    }

    if (situationImages.length === 0) {
      setError("Vui lòng tải lên ít nhất một hình ảnh minh họa");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Lọc ra những item có dữ liệu
      const validItems = items.filter(
        (item) => item.name.trim() !== "" && item.quantity > 0
      );

      const { data } = await axios.post(
        "/api/cases",
        {
          title,
          description,
          category,
          supportType,
          targetAmount: supportType !== "items" ? Number(targetAmount) : 0,
          situationImages,
          proofImages,
          neededItems: supportType !== "money" ? validItems : [],
          location,
          contactInfo,
          endDate,
        },
        config
      );

      setSuccess(true);

      // Chuyển hướng đến trang chi tiết sau 2s
      setTimeout(() => {
        navigate(`/case/${data._id}`);
      }, 2000);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tạo hoàn cảnh mới</h1>

      {error && (
        <Message variant="error" className="mb-4">
          {error}
        </Message>
      )}
      {success && (
        <Message variant="success" className="mb-4">
          Hoàn cảnh đã được tạo thành công! Đang chuyển hướng...
        </Message>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        {/* Thông tin cơ bản */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>

          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 font-medium">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nhập tiêu đề"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block mb-1 font-medium">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Chọn danh mục</option>
              <option value="medical">Y tế</option>
              <option value="education">Giáo dục</option>
              <option value="disaster">Thiên tai</option>
              <option value="animal">Động vật</option>
              <option value="environmental">Môi trường</option>
              <option value="community">Cộng đồng</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="supportType" className="block mb-1 font-medium">
              Loại hỗ trợ <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="supportType"
                  value="money"
                  checked={supportType === "money"}
                  onChange={() => setSupportType("money")}
                  className="mr-2"
                />
                <span>Quyên góp tiền</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="supportType"
                  value="items"
                  checked={supportType === "items"}
                  onChange={() => setSupportType("items")}
                  className="mr-2"
                />
                <span>Hỗ trợ vật phẩm</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="supportType"
                  value="both"
                  checked={supportType === "both"}
                  onChange={() => setSupportType("both")}
                  className="mr-2"
                />
                <span>Cả hai</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 font-medium">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="5"
              placeholder="Mô tả chi tiết về hoàn cảnh"
              required
            ></textarea>
          </div>
        </div>

        {/* Thông tin về mục tiêu */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin mục tiêu</h2>

          {/* Mục tiêu tiền */}
          {(supportType === "money" || supportType === "both") && (
            <div className="mb-4">
              <label htmlFor="targetAmount" className="block mb-1 font-medium">
                Số tiền mục tiêu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="targetAmount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập số tiền mục tiêu"
                  min="0"
                  step="1000"
                  required={supportType === "money" || supportType === "both"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">VND</span>
                </div>
              </div>
            </div>
          )}

          {/* Vật phẩm cần hỗ trợ */}
          {(supportType === "items" || supportType === "both") && (
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Vật phẩm cần hỗ trợ <span className="text-red-500">*</span>
              </label>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center gap-2 mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex-grow min-w-[200px]">
                    <label className="text-sm text-gray-600 mb-1 block">
                      Tên vật phẩm
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Tên vật phẩm"
                      required={
                        supportType === "items" || supportType === "both"
                      }
                    />
                  </div>

                  <div className="w-24">
                    <label className="text-sm text-gray-600 mb-1 block">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Số lượng"
                      min="1"
                      required={
                        supportType === "items" || supportType === "both"
                      }
                    />
                  </div>

                  <div className="w-24">
                    <label className="text-sm text-gray-600 mb-1 block">
                      Đơn vị
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="cái">Cái</option>
                      <option value="chiếc">Chiếc</option>
                      <option value="bộ">Bộ</option>
                      <option value="kg">Kg</option>
                      <option value="thùng">Thùng</option>
                      <option value="hộp">Hộp</option>
                      <option value="gói">Gói</option>
                    </select>
                  </div>

                  <div className="flex items-end pb-2">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      disabled={items.length <= 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="mt-2 flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Thêm vật phẩm
              </button>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="endDate" className="block mb-1 font-medium">
              Ngày kết thúc
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Thông tin liên hệ và địa điểm */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Thông tin liên hệ và địa điểm
          </h2>

          <div className="mb-4">
            <label htmlFor="location" className="block mb-1 font-medium">
              Địa điểm
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nhập địa điểm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="contactInfo" className="block mb-1 font-medium">
              Thông tin liên hệ
            </label>
            <textarea
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Nhập thông tin liên hệ (số điện thoại, email, ...)"
            ></textarea>
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Hình ảnh</h2>

          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Hình ảnh minh họa tình huống{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => uploadFileHandler(e, "situation")}
              multiple
              className="w-full p-2 border border-gray-300 rounded-md"
              accept="image/*"
            />
            {uploading && <Loader size="small" />}
            {uploadError && <Message variant="error">{uploadError}</Message>}

            {situationImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {situationImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Situation ${index}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, "situation")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Hình ảnh minh chứng
            </label>
            <input
              type="file"
              onChange={(e) => uploadFileHandler(e, "proof")}
              multiple
              className="w-full p-2 border border-gray-300 rounded-md"
              accept="image/*"
            />

            {proofImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {proofImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Proof ${index}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, "proof")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            disabled={loading || uploading}
          >
            {loading ? <Loader color="white" size="small" /> : "Tạo hoàn cảnh"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCaseScreen;
