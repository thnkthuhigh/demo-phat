import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCaseDetails } from '../store/actions/caseActions';
import Loader from '../components/shared/Loader';
import Message from '../components/shared/Message';

const CreateSupportScreen = () => {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [amount, setAmount] = useState(100000);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [transactionId, setTransactionId] = useState('');
  
  const { caseDetails, loading: loadingCaseDetails } = useSelector((state) => state.cases);
  const { loading, error, success } = useSelector((state) => state.support);
  
  useEffect(() => {
    dispatch(fetchCaseDetails(caseId));
  }, [dispatch, caseId]);
  
  // Redirect after successful support
  useEffect(() => {
    if (success) {
      navigate(`/case/${caseId}`);
    }
  }, [success, navigate, caseId]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const submitHandler = (e) => {
    e.preventDefault();
    
    // You would implement your actual support action here
    console.log({
      caseId,
      amount,
      message,
      anonymous,
      paymentMethod,
      transactionId
    });
    
    // Mock submission success
    alert('Cảm ơn bạn đã ủng hộ!');
    navigate(`/case/${caseId}`);
  };
  
  if (loadingCaseDetails) {
    return <Loader />;
  }
  
  if (!caseDetails) {
    return <Message>Không tìm thấy hoàn cảnh</Message>;
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ủng hộ</h1>
      
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold">{caseDetails.title}</h2>
        <div className="mt-2 flex items-center">
          <img
            src={caseDetails.user?.avatar || "https://via.placeholder.com/40"}
            alt={caseDetails.user?.name}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="text-gray-600">{caseDetails.user?.name}</span>
        </div>
      </div>
      
      {error && <Message variant="error">{error}</Message>}
      
      <form onSubmit={submitHandler} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-6">
          <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
            Số tiền ủng hộ
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg pr-12"
              min="10000"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              VND
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAmount(50000)}
              className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              {formatCurrency(50000)}
            </button>
            <button
              type="button"
              onClick={() => setAmount(100000)}
              className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              {formatCurrency(100000)}
            </button>
            <button
              type="button"
              onClick={() => setAmount(200000)}
              className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              {formatCurrency(200000)}
            </button>
            <button
              type="button"
              onClick={() => setAmount(500000)}
              className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              {formatCurrency(500000)}
            </button>
            <button
              type="button"
              onClick={() => setAmount(1000000)}
              className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              {formatCurrency(1000000)}
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
            Lời nhắn (tùy chọn)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows="3"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <span className="ml-2 text-gray-700">Ủng hộ ẩn danh</span>
          </label>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Phương thức thanh toán
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="border rounded-lg p-3 flex items-center cursor-pointer">
              <input
                type="radio"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Chuyển khoản</span>
            </label>
            <label className="border rounded-lg p-3 flex items-center cursor-pointer">
              <input
                type="radio"
                value="momo"
                checked={paymentMethod === 'momo'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">MoMo</span>
            </label>
            <label className="border rounded-lg p-3 flex items-center cursor-pointer">
              <input
                type="radio"
                value="zalopay"
                checked={paymentMethod === 'zalopay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">ZaloPay</span>
            </label>
          </div>
        </div>
        
        {paymentMethod === 'bank_transfer' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Thông tin chuyển khoản</h3>
            <p>Ngân hàng: <span className="font-medium">VCB - Ngân hàng TMCP Ngoại Thương</span></p>
            <p>Số tài khoản: <span className="font-medium">1234567890</span></p>
            <p>Chủ tài khoản: <span className="font-medium">Quỹ Từ Thiện TangTang</span></p>
            <p>Nội dung CK: <span className="font-medium">UH_{caseId}_{Date.now().toString().slice(-6)}</span></p>
            
            <div className="mt-4">
              <label htmlFor="transactionId" className="block text-gray-700 font-medium mb-2">
                Mã giao dịch (Nếu đã chuyển khoản)
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : `Ủng hộ ${formatCurrency(amount)}`}
        </button>
      </form>
    </div>
  );
};

export default CreateSupportScreen;