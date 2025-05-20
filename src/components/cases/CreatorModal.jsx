// components/case/CreatorModal.jsx
import { Link } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../utils/constants";

const CreatorModal = ({
  creatorDetails,
  formatDate,
  formatCurrency,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Đóng"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content sections */}
        <div className="text-center mb-6">
          {/* Profile image and basic info */}
        </div>

        {/* Bio section */}
        {creatorDetails.bio && (
          <div className="mb-4 border-t border-b border-gray-200 py-4">
            {/* Bio content */}
          </div>
        )}

        {/* Stats grid */}
        <div className="mb-5">{/* Activity stats */}</div>

        {/* Social links - wrapped in Fragment */}
        <>
          {creatorDetails.socialLinks &&
            Object.values(creatorDetails.socialLinks).some((link) => link) && (
              <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                {/* Social links */}
              </div>
            )}

          {/* Profile link button */}
          <div className="text-center mt-6">
            <Link
              to={`/user/${creatorDetails._id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              {/* Button content */}
            </Link>
          </div>
        </>
      </div>
    </div>
  );
};

export default CreatorModal;
