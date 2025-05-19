import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Loader from "./ui/Loader";
import { toast } from "react-toastify";

const FileUpload = ({
  onFileUpload,
  multiple = false,
  acceptedFileTypes = "image/*",
  fieldName = "images",
  maxFileSize = 5, // MB
  label = "Tải file lên",
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const { userInfo } = useSelector((state) => state.auth);

  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Kiểm tra kích thước file
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxFileSize * 1024 * 1024) {
        setError(
          `File "${files[i].name}" vượt quá kích thước cho phép (${maxFileSize}MB)`
        );
        return;
      }
    }

    setError("");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();

    // Thêm file vào FormData với tên trường đã chỉ định
    if (multiple) {
      // Với nhiều file, thêm mỗi file với cùng tên field
      for (let i = 0; i < files.length; i++) {
        formData.append(fieldName, files[i]);
      }
    } else {
      // Với một file
      formData.append(fieldName, files[0]);
    }

    // Log để debug
    console.log(
      `Uploading ${files.length} files with field name "${fieldName}"`
    );

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      };

      // Chọn endpoint dựa trên chế độ multiple và loại file
      const endpoint = multiple ? "/api/uploads" : "/api/uploads/single";

      console.log(`Uploading to ${endpoint}`);

      const { data } = await axios.post(endpoint, formData, config);

      // Xử lý đường dẫn file trả về
      if (multiple) {
        onFileUpload(data.images || []);
      } else {
        onFileUpload(data.image || "");
      }

      setUploading(false);
      toast.success("Tải file lên thành công!");
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Có lỗi xảy ra khi tải lên file"
      );
      setUploading(false);
      toast.error("Lỗi khi tải file lên!");
    }
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col items-center">
        <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
          <svg
            className="w-8 h-8"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
          </svg>
          <span className="mt-2 text-base leading-normal">{label}</span>
          <input
            type="file"
            accept={acceptedFileTypes}
            className="hidden"
            multiple={multiple}
            onChange={uploadFileHandler}
          />
        </label>

        {uploading && (
          <div className="w-full mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <Loader size="small" /> {progress}%
            </div>
          </div>
        )}

        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default FileUpload;

// Trong component CreateCaseScreen

import FileUpload from "../components/FileUpload";

// State để lưu đường dẫn hình ảnh và tài liệu
const [images, setImages] = useState([]);
const [documents, setDocuments] = useState([]);

// Hàm xử lý khi upload hình ảnh thành công
const handleImagesUploaded = (uploadedImages) => {
  setImages([
    ...images,
    ...(Array.isArray(uploadedImages) ? uploadedImages : [uploadedImages]),
  ]);
};

// Hàm xử lý khi upload tài liệu thành công
const handleDocumentsUploaded = (uploadedDocs) => {
  setDocuments([
    ...documents,
    ...(Array.isArray(uploadedDocs) ? uploadedDocs : [uploadedDocs]),
  ]);
};

// Trong phần render
return (
  <form onSubmit={handleSubmit}>
    {/* Các field form khác */}

    {/* Upload hình ảnh */}
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2">Hình ảnh</label>
      <FileUpload
        onFileUpload={handleImagesUploaded}
        multiple={true}
        acceptedFileTypes="image/*"
        fieldName="images"
        maxFileSize={5}
        label="Tải hình ảnh lên"
      />

      {/* Hiển thị hình ảnh đã upload */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img}
                alt={`Hình ${idx + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  setImages(images.filter((_, i) => i !== idx));
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Upload tài liệu */}
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2">
        Tài liệu đính kèm
      </label>
      <FileUpload
        onFileUpload={handleDocumentsUploaded}
        multiple={true}
        acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
        fieldName="documents"
        maxFileSize={10}
        label="Tải tài liệu lên"
      />

      {/* Hiển thị tài liệu đã upload */}
      {documents.length > 0 && (
        <div className="mt-4">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc, idx) => (
              <li key={idx} className="py-2 flex justify-between items-center">
                <a
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"></path>
                  </svg>
                  {doc.split("/").pop()}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setDocuments(documents.filter((_, i) => i !== idx));
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {/* Submit button */}
    <button type="submit" className="btn btn-primary">
      Tạo hoàn cảnh
    </button>
  </form>
);
