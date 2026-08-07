import { useState } from "react";
import { motion } from "framer-motion";
import { FiStar, FiCheck, FiX, FiFlag, FiMessageSquare, FiShield } from "react-icons/fi";
import { reviews } from "../../data/reviews";
const tabCounts = (tab) => reviews.filter((r) => r.status === tab).length;
const StarRating = ({ rating }) => <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => <FiStar
  key={s}
  size={14}
  className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
/>)}
  </div>;
const ReviewCard = ({ review, onApprove, onReject, onFlag }) => <motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  className={`bg-white rounded-xl border shadow-sm overflow-hidden ${review.status === "pending" ? "border-l-4 border-l-amber-400 border-gray-100" : review.status === "reported" ? "border-l-4 border-l-red-400 border-gray-100" : "border-gray-100"}`}
>
    <div className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#f0ebe2] flex items-center justify-center text-[#2d4a3e] font-bold text-sm flex-shrink-0">
            {review.customerName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{review.customerName}</span>
              {review.verified && <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  <FiShield size={9} /> Verified
                </span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{review.productName}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} />
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {
  /* Actions */
}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto sm:flex-shrink-0">
          {review.status === "pending" && <>
              <button
  onClick={onApprove}
  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
>
                <FiCheck size={12} /> Approve
              </button>
              <button
  onClick={onReject}
  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
>
                <FiX size={12} /> Reject
              </button>
            </>}
          {review.status === "published" && <button
  onClick={onReject}
  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
>
              <FiX size={12} /> Unpublish
            </button>}
          <button
  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
  title="Reply"
>
            <FiMessageSquare size={14} />
          </button>
          <button
  onClick={onFlag}
  className={`p-1.5 rounded-lg transition-colors ${review.status === "reported" ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
  title="Flag"
>
            <FiFlag size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 pl-0 sm:pl-12 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{review.title}</p>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
        {review.helpful > 0 && <p className="text-xs text-gray-400 mt-2">{review.helpful} people found this helpful</p>}
      </div>
    </div>
  </motion.div>;
function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [reviewList, setReviewList] = useState(reviews);
  const filtered = reviewList.filter((r) => r.status === activeTab);
  const approve = (id) => setReviewList((prev) => prev.map((r) => r.id === id ? { ...r, status: "published" } : r));
  const reject = (id) => setReviewList((prev) => prev.filter((r) => r.id !== id));
  const flag = (id) => setReviewList((prev) => prev.map((r) => r.id === id ? { ...r, status: "reported" } : r));
  const tabs = [
    { value: "pending", label: "Pending" },
    { value: "published", label: "Published" },
    { value: "reported", label: "Reported" }
  ];
  return <div className="space-y-5">
      {
    /* Header */
  }
      <div>
        <h1 className="font-display text-2xl text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage customer reviews and ratings</p>
      </div>

      {
    /* Tabs */
  }
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
    const count = reviewList.filter((r) => r.status === tab.value).length;
    return <button
      key={tab.value}
      onClick={() => setActiveTab(tab.value)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
    >
              {tab.label}
              {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.value ? tab.value === "pending" ? "bg-amber-100 text-amber-700" : tab.value === "reported" ? "bg-red-100 text-red-600" : "bg-[#2d4a3e] text-white" : "bg-gray-200 text-gray-600"}`}>
                  {count}
                </span>}
            </button>;
  })}
      </div>

      {
    /* Review Cards */
  }
      <div className="space-y-3">
        {filtered.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
            <p className="text-gray-400 text-sm">No {activeTab} reviews</p>
          </div> : filtered.map((review) => <ReviewCard
    key={review.id}
    review={review}
    onApprove={() => approve(review.id)}
    onReject={() => reject(review.id)}
    onFlag={() => flag(review.id)}
  />)}
      </div>
    </div>;
}
export {
  ReviewsPage as default
};
