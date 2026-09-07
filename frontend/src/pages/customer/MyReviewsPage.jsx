import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiX } from "react-icons/fi";
import { reviewApi } from "../../services/api";

const STATUS_LABEL = { PENDING: "Pending", APPROVED: "Published", REJECTED: "Rejected" };

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => <button
    key={n}
    type="button"
    onMouseEnter={() => setHovered(n)}
    onMouseLeave={() => setHovered(0)}
    onClick={() => onChange(n)}
    className="transition-colors"
    style={{ color: n <= (hovered || value) ? "#c9b99a" : "#f0ebe2" }}
  >
          <FiStar size={24} fill={n <= (hovered || value) ? "#c9b99a" : "none"} />
        </button>)}
    </div>;
}

function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getMine();
      setReviews((res.data || []).map((r) => ({
        id: r.id,
        product: r.product?.name || "Product",
        productImage: Array.isArray(r.product?.images) ? r.product.images[0] : "",
        rating: Number(r.rating || 0),
        body: r.comment || "",
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
        status: STATUS_LABEL[r.status] || "Pending"
      })));
    } catch (err) {
      console.error("Failed to load my reviews", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = reviews.filter((r) => activeTab === "All" || r.status === activeTab);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-6" style={{ color: "#0a0a0a" }}>My Reviews</h1>
        <div className="grid grid-cols-3 gap-4">
          {[
    { label: "Written", value: String(reviews.length) },
    { label: "Published", value: String(reviews.filter((r) => r.status === "Published").length) },
    { label: "Avg Rating Given", value: avg }
  ].map((stat) => <div key={stat.label} className="p-4 border text-center" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
              <p className="font-display text-2xl mb-1" style={{ color: "#0a0a0a" }}>{stat.value}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#8c8277" }}>{stat.label}</p>
            </div>)}
        </div>
      </div>

      <div className="flex gap-0 mb-6 border-b" style={{ borderColor: "#f0ebe2" }}>
        {["All", "Pending", "Published", "Rejected"].map((tab) => <button
    key={tab}
    type="button"
    onClick={() => setActiveTab(tab)}
    className="px-5 py-3 text-xs tracking-widest uppercase transition-colors"
    style={{
      color: activeTab === tab ? "#0a0a0a" : "#8c8277",
      fontFamily: "Manrope, sans-serif",
      borderBottom: activeTab === tab ? "2px solid #0a0a0a" : "2px solid transparent",
      marginBottom: "-1px"
    }}
  >
            {tab}
          </button>)}
      </div>

      {loading ? <p className="text-sm py-10 text-center" style={{ color: "#8c8277" }}>Loading your reviews…</p>
      : filtered.length === 0 ? <p className="text-sm py-10 text-center" style={{ color: "#8c8277" }}>
          {reviews.length === 0 ? "You haven't written any reviews yet. Reviews can be left on products from delivered orders." : `No ${activeTab.toLowerCase()} reviews.`}
        </p>
      : <div className="flex flex-col gap-4 mb-10">
        {filtered.map((review) => <div key={review.id} className="border p-5" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
            <div className="flex gap-4">
              {review.productImage && <img src={review.productImage} alt={review.product} className="w-20 h-28 object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8c8277" }}>{review.product}</p>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((n) => <FiStar key={n} size={13} style={{ color: n <= review.rating ? "#c9b99a" : "#f0ebe2" }} fill={n <= review.rating ? "#c9b99a" : "none"} />)}
                    </div>
                  </div>
                  <span
    className="text-[10px] px-2 py-1 uppercase tracking-widest font-semibold flex-shrink-0"
    style={{
      backgroundColor: review.status === "Published" ? "#2d4a3e" : review.status === "Rejected" ? "#b91c1c" : "#c9b99a",
      color: "#fafafa"
    }}
  >
                    {review.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#8c8277" }}>{review.body}</p>
                <span className="text-xs" style={{ color: "#8c8277" }}>{review.date}</span>
              </div>
            </div>
          </div>)}
      </div>}
    </div>;
}
export {
  MyReviewsPage as default
};
