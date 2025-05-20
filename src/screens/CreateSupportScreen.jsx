import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from '../components/shared/Loader';
import Message from '../components/shared/Message';

const CreateSupportScreen = () => {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho tiền ủng hộ
  const [amount, setAmount] = useState('');
  
  // State cho vật phẩm ủng hộ
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [transactionId, setTransactionId] = useState('');
  const [success, setSuccess] = useState(false);
  const [supportId, setSupportId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  useEffect(() => {
    if (!userInfo) {
      navigate(`/login?redirect=support/${caseId}`);
      return;
    }
    
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/cases/${caseId}`);
        setCaseDetails(data);
        
        // Khởi tạo danh sách vật phẩm được chọn nếu có
        if (data.neededItems && data.neededItems.length > 0) {
          const initialItems = data.neededItems.map(item => ({
            ...item,
            selected: false,
            donateQuantity: 0
          }));
          setSelectedItems(initialItems);
        }
        
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
        setLoading(false);
      }
    };
    
    fetchCaseDetails();
  }, [caseId, userInfo, navigate]);
  
  // Cập nhật số lượng vật phẩm muốn đóng góp
  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].donateQuantity = Number(quantity);
    updatedItems[index].selected = Number(quantity) > 0;
    setSelectedItems(updatedItems);
  };
  
  // Chọn/bỏ chọn vật phẩm
  const toggleItemSelection = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].selected = !updatedItems[index].selected;
    
    // Nếu chọn vật phẩm nhưng số lượng = 0, đặt số lượng mặc định = 1
    if (updatedItems[index].selected && updatedItems[index].donateQuantity === 0) {
      updatedItems[index].donateQuantity = 1;
    } else if (!updatedItems[index].selected) {
      updatedItems[index].donateQuantity = 0;
    }
    
    setSelectedItems(updatedItems);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation dựa trên loại hỗ trợ
    const isSupportingMoney = caseDetails.supportType === "money" || caseDetails.supportType === "both";
    const isSupportingItems = caseDetails.supportType === "items" || caseDetails.supportType === "both";
    
    if (isSupportingMoney && (!amount || isNaN(amount) || Number(amount) <= 0)) {
      setSubmitError('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    if (isSupportingItems && !selectedItems.some(item => item.selected && item.donateQuantity > 0)) {
      setSubmitError('Vui lòng chọn ít nhất một vật phẩm để ủng hộ');
      return;
    }
    
    if (isSupportingMoney && paymentMethod === 'transfer' && !transactionId) {
      setSubmitError('Vui lòng nhập mã giao dịch');
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Lọc các item được chọn để hỗ trợ
      const itemsToSupport = selectedItems
        .filter(item => item.selected && item.donateQuantity > 0)
        .map(item => ({
          itemId: item._id,
          name: item.name,
          quantity: item.donateQuantity,
          unit: item.unit
        }));
      
      const { data } = await axios.post(
        `/api/cases/${caseId}/support`,
        {
          amount: isSupportingMoney ? Number(amount) : 0,
          items: isSupportingItems ? itemsToSupport : [],
          message,
          anonymous,
          paymentMethod,
          transactionId,
        },
        config
      );
      
      setSuccess(true);
      setSupportId(data._id);
      setSubmitting(false);
      
      // Sau 5 giây, chuyển hướng về trang chi tiết hoàn cảnh
      setTimeout(() => {
        navigate(`/case/${caseId}`);
      }, 5000);
    } catch (error) {
      setSubmitError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setSubmitting(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) return <Loader />;
  if (error) return <Message variant="error">{error}</Message>;
  if (!caseDetails) return <Message variant="error">Không tìm thấy hoàn cảnh</Message>;
  
  // Xác định loại hỗ trợ
  const isSupportingMoney = caseDetails.supportType === "money" || caseDetails.supportType === "both";
  const isSupportingItems = caseDetails.supportType === "items" || caseDetails.supportType === "both";
  
  return (
    <div className="max-w-4xl mx-auto">
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold text-green-800 mb-2">Cảm ơn bạn đã ủng hộ!</h2>
          <p className="text-green-700 mb-4">
            Chúng tôi đã ghi nhận khoản ủng hộ của bạn và sẽ thông báo khi nó được duyệt.
          </p>
          <p className="text-gray-600 mb-6">
            Mã ủng hộ: <span className="font-mono">{supportId}</span>
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(`/case/${caseId}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Quay về trang hoàn cảnh
            </button>
            <button
              onClick={() => navigate('/my-supports')}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xem lịch sử ủng hộ
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="md:w-1/3">
              <img
                src={caseDetails.situationImages?.[0] || 'https://via.placeholder.com/300'}
                alt={caseDetails.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-2xl font-bold mb-2">{caseDetails.title}</h1>
              
              {isSupportingMoney && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ 
                        width: `${Math.min(Math.round((caseDetails.currentAmount / caseDetails.targetAmount) * 100), 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>{formatCurrency(caseDetails.currentAmount)}</span>
                    <span>{formatCurrency(caseDetails.targetAmount)}</span>
                  </div>
                </div>
              )}
              
              {isSupportingItems && caseDetails.neededItems && caseDetails.neededItems.length > 0 && (
                <div className="mb-4 space-y-2">
                  {caseDetails.neededItems.slice(0, 2).map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span>
                          {item.receivedQuantity}/{item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              Math.round((item.receivedQuantity / item.quantity) * 100),
                              100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {caseDetails.neededItems.length > 2 && (
                    <p className="text-sm text-indigo-600">+ {caseDetails.neededItems.length - 2} vật phẩm khác</p>
                  )}
                </div>
              )}
              
              <p className="text-gray-600 line-clamp-3">{caseDetails.description}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Thông tin ủng hộ</h2>
            
            {submitError && <Message variant="error" className="mb-4">{submitError}</Message>}
            
            <form onSubmit={handleSubmit}>
              {/* Phần ủng hộ tiền */}
              {isSupportingMoney && (
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Số tiền ủng hộ {isSupportingMoney && !isSupportingItems && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập số tiền"
                      required={isSupportingMoney && !isSupportingItems}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                      VND
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAmount('50000')}
                      className="bg-gray-100 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      50,000đ
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('100000')}
                      className="bg-gray-100 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      100,000đ
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('200000')}
                      className="bg-gray-100 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      200,000đ
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('500000')}
                      className="bg-gray-100 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      500,000đ
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('1000000')}
                      className="bg-gray-100 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      1,000,000đ
                    </button>
                  </div>
                </div>
              )}
              
              {/* Phần ủng hộ vật phẩm */}
              {isSupportingItems && caseDetails.neededItems && caseDetails.neededItems.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vật phẩm ủng hộ {isSupportingItems && !isSupportingMoney && <span className="text-red-500">*</span>}
                  </label>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Chọn
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên vật phẩm
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tiến độ
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng ủng hộ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedItems.map((item, index) => (
                          <tr key={index} className={item.selected ? "bg-indigo-50" : ""}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleItemSelection(index)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ({item.unit})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm text-gray-500">
                                  {item.receivedQuantity}/{item.quantity} {item.unit}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full" 
                                    style={{ 
                                      width: `${Math.min(Math.round((item.receivedQuantity / item.quantity) * 100), 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max={item.quantity - item.receivedQuantity}
                                value={item.donateQuantity}
                                onChange={(e) => updateItemQuantity(index, e.target.value)}
                                disabled={!item.selected}
                                className={`w-20 border rounded-md p-1 text-center ${
                                  item.selected 
                                    ? "border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500" 
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              />
                              <span className="ml-2 text-sm text-gray-500">{item.unit}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Phần thông tin chung */}
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Lời nhắn (không bắt buộc)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập lời nhắn của bạn"
                ></textarea>
              </div>
              
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                  Ủng hộ ẩn danh
                </label>
              </div>
              
              {/* Thông tin thanh toán (chỉ hiển thị nếu có ủng hộ tiền) */}
              {isSupportingMoney && Number(amount) > 0 && (
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin thanh toán</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phương thức thanh toán
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={paymentMethod === 'transfer'}
                          onChange={() => setPaymentMethod('transfer')}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Chuyển khoản</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="momo"
                          checked={paymentMethod === 'momo'}
                          onChange={() => setPaymentMethod('momo')}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">MoMo</span>
                      </label>
                    </div>
                  </div>
                  
                  {paymentMethod === 'transfer' && (
                    <>
                      <div className="mb-4 border p-4 rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-2">Thông tin chuyển khoản</h4>
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Ngân hàng: </span>
                          <span className="font-medium">MB Bank</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Số tài khoản: </span>
                          <span className="font-medium">9999 8888 7777</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Chủ tài khoản: </span>
                          <span className="font-medium">Trung Tâm Hỗ Trợ Cộng Đồng</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Nội dung: </span>
                          <span className="font-medium">HOTRO {caseId}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                          Mã giao dịch <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="transactionId"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Nhập mã giao dịch"
                          required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Vui lòng nhập mã giao dịch để xác nhận chuyển khoản của bạn
                        </p>
                      </div>
                    </>
                  )}
                  
                  {paymentMethod === 'momo' && (
                    <div className="mb-6 border-t border-b border-gray-200 py-4">
                      <h3 className="font-medium mb-2">Thanh toán qua MoMo</h3>
                      <div className="flex justify-center mb-4">
                        <img
                          src="/images/momo-qr.png"
                          alt="MoMo QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-center text-sm text-gray-600">
                        Quét mã QR để thanh toán qua MoMo
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
                  disabled={submitting}
                >
                  {submitting ? <Loader color="white" size="small" /> : 'Hoàn tất ủng hộ'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-2">Lưu ý:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Khoản ủng hộ sẽ được kiểm duyệt trước khi được cập nhật vào tiến độ hoàn cảnh.</li>
              <li>Bạn có thể theo dõi trạng thái ủng hộ trong phần "Lịch sử ủng hộ" trên trang cá nhân.</li>
              <li>Mọi thắc mắc vui lòng liên hệ hotline: 0123 456 789.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateSupportScreen;