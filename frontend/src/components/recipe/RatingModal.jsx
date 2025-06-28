import { useState } from "react";
import { FaStar, FaTimes, FaSave } from "react-icons/fa";
import RatingStars from "../common/RatingStars";

const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentRating = 0,
  currentReview = "",
  isLoading = false,
}) => {
  const [rating, setRating] = useState(currentRating);
  const [review, setReview] = useState(currentReview);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5 stars");
      return;
    }
    onSubmit({ rating, review });
  };

  const handleClose = () => {
    setRating(currentRating);
    setReview(currentReview);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="max-w-md modal-box bg-orange-50 font-brand">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-orange-800">
            Rate this Recipe
          </h2>
          <button
            onClick={handleClose}
            className="btn btn-circle btn-sm btn-ghost"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="mb-4 text-orange-800">
              How would you rate this recipe?
            </p>
            <div className="flex justify-center">
              <RatingStars
                rating={rating}
                size="xl"
                interactive={true}
                onRatingChange={setRating}
                showText={false}
              />
            </div>
            {rating > 0 && (
              <p className="mt-2 text-lg font-medium text-yellow-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium text-orange-800 label-text">
                Review (Optional)
              </span>
            </label>
            <textarea
              className="h-24 textarea textarea-bordered bg-white"
              placeholder="Share your thoughts about this recipe..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`btn px-4 py-2 text-sm font-semibold text-white bg-red-400 border border-gray-300 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200
                ${
                isLoading || rating === 0
                    ? "bg-orange-500 text-white cursor-not-allowed opacity-50"
                    : "bg-orange-800 text-white hover:bg-orange-900"
                }
            `}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <FaSave className="text-base" />
                  {currentRating > 0 ? "Update Rating" : "Submit Rating"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
