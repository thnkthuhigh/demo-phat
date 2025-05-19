import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCase } from '../store/actions/caseActions';

const CreateCaseScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [targetAmount, setTargetAmount] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [uploading, setUploading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success } = useSelector((state) => state.cases);
  
  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    try {
      // Here you would implement your file upload logic
      // For example, using FormData and axios
      console.log('File upload logic would go here');
      
      // Mock implementation
      setTimeout(() => {
        const uploadedUrls = files.map((file) => URL.createObjectURL(file));
        setImages([...images, ...uploadedUrls]);
        setUploading(false);
      }, 1000);
    } catch (error) {
      console.error('File upload failed', error);
      setUploading(false);
    }
  };
  
  const submitHandler = (e) => {
    e.preventDefault();
    
    const caseData = {
      title,
      description,
      category,
      images,
      targetAmount: Number(targetAmount),
      location,
      contactInfo,
      endDate,
    };
    
    dispatch(createCase(caseData));
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tạo hoàn cảnh mới</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Tiêu đề
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Mô tả chi tiết
          </label>
          <textarea
            id="description"
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
            Danh mục
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
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
          <label htmlFor="images" className="block text-gray-700 font-medium mb-2">
            Hình ảnh
          </label>
          <input
            type="file"
            id="images"
            onChange={uploadFileHandler}
            className="w-full px-4 py-2 border rounded-lg"
            multiple
            accept="image/*"
          />
          {uploading && <p>Đang tải lên...</p>}
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => {
                      setImages(images.filter((_, i) => i !== index));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="targetAmount" className="block text-gray-700 font-medium mb-2">
            Số tiền mục tiêu (VND)
          </label>
          <input
            type="number"
            id="targetAmount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            min="0"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
            Địa điểm
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="contactInfo" className="block text-gray-700 font-medium mb-2">
            Thông tin liên hệ
          </label>
          <input
            type="text"
            id="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
            Ngày kết thúc
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          disabled={loading || uploading}
        >
          {loading ? 'Đang xử lý...' : 'Tạo hoàn cảnh'}
        </button>
      </form>
    </div>
  );
};

export default CreateCaseScreen;