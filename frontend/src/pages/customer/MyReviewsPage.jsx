import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiThumbsUp, FiEdit2, FiTrash2, FiX, FiUpload } from "react-icons/fi";
const reviews = [
  {
    id: "r1",
    product: "Cashmere Wrap Coat",
    productImage: "https://images.unsplash.com/photo-1548624313-0396a0175a23?w=200&h=267&fit=crop&auto=format",
    rating: 5,
    title: "Absolute perfection \u2014 worth every penny",
    body: "I have been eyeing this coat for months and finally treated myself. The cashmere is incredibly soft and the drape is just stunning. I have received so many compliments already.",
    date: "15 Jan 2024",
    helpful: 42,
    status: "Published"
  },
  {
    id: "r2",
    product: "Relaxed Wool Trouser",
    productImage: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=267&fit=crop&auto=format",
    rating: 4,
    title: "Great quality, runs slightly large",
    body: "Really beautiful trousers. I would recommend sizing down \u2014 I am usually a 12 and the 10 fits perfectly. The wool is warm without being heavy.",
    date: "3 Dec 2023",
    helpful: 5,
    status: "Published"
  }
];
const pendingProducts = [
  { id: "pp1", name: "Silk Slip Dress", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=267&fit=crop&auto=format" },
  { id: "pp2", name: "Oversized Cotton Poplin Shirt", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=267&fit=crop&auto=format" }
];
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
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(null);
  const [modalRating, setModalRating] = useState(0);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const filtered = reviews.filter((r) => activeTab === "All" || r.status === activeTab);
  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(null);
      setModalRating(0);
      setModalTitle("");
      setModalBody("");
    }, 1600);
  }
  return <div>
      {
    /* Header + stats */
  }
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-6" style={{ color: "#0a0a0a" }}>My Reviews</h1>
        <div className="grid grid-cols-3 gap-4">
          {[
    { label: "Written", value: "2" },
    { label: "Helpful Votes", value: "47" },
    { label: "Avg Rating Given", value: "4.9" }
  ].map((stat) => <div key={stat.label} className="p-4 border text-center" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
              <p className="font-display text-2xl mb-1" style={{ color: "#0a0a0a" }}>{stat.value}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#8c8277" }}>{stat.label}</p>
            </div>)}
        </div>
      </div>

      {
    /* Tabs */
  }
      <div className="flex gap-0 mb-6 border-b" style={{ borderColor: "#f0ebe2" }}>
        {["All", "Pending", "Published"].map((tab) => <button
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

      {
    /* Review cards */
  }
      <div className="flex flex-col gap-4 mb-10">
        {filtered.map((review) => <div key={review.id} className="border p-5" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
            <div className="flex gap-4">
              <img src={review.productImage} alt={review.product} className="w-20 h-28 object-cover flex-shrink-0" />
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
      backgroundColor: review.status === "Published" ? "#2d4a3e" : "#c9b99a",
      color: "#fafafa"
    }}
  >
                    {review.status}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#0a0a0a" }}>{review.title}</p>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#8c8277" }}>{review.body}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: "#8c8277" }}>{review.date}</span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#8c8277" }}>
                      <FiThumbsUp size={12} /> Helpful ({review.helpful})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1.5 hover:opacity-60 transition-opacity" style={{ color: "#8c8277" }} aria-label="Edit review">
                      <FiEdit2 size={13} />
                    </button>
                    <button type="button" className="p-1.5 hover:opacity-60 transition-opacity" style={{ color: "#8c8277" }} aria-label="Delete review">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>)}
      </div>

      {
    /* Pending review prompts */
  }
      <div>
        <h2 className="text-xs tracking-widest uppercase mb-4" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>Recently Purchased — Share Your Thoughts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingProducts.map((p) => <div key={p.id} className="flex gap-4 p-4 border" style={{ borderColor: "#f0ebe2", backgroundColor: "#fafafa", fontFamily: "Manrope, sans-serif" }}>
              <img src={p.image} alt={p.name} className="w-16 h-22 object-cover flex-shrink-0" />
              <div className="flex flex-col justify-between">
                <p className="text-sm font-medium" style={{ color: "#0a0a0a" }}>{p.name}</p>
                <button
    type="button"
    onClick={() => setShowModal(p.id)}
    className="text-xs px-4 py-2 border tracking-widest uppercase transition-colors hover:bg-[#0a0a0a] hover:text-[#fafafa] hover:border-[#0a0a0a] self-start"
    style={{ borderColor: "#c9b99a", color: "#8c8277" }}
  >
                  Write a Review
                </button>
              </div>
            </div>)}
        </div>
      </div>

      {
    /* Write review modal */
  }
      <AnimatePresence>
        {showModal && <>
            <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-40 bg-[#0a0a0a]/50"
    onClick={() => setShowModal(null)}
  />
            <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.22 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
              <div className="w-full max-w-lg bg-[#fafafa] p-6" style={{ fontFamily: "Manrope, sans-serif" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl" style={{ color: "#0a0a0a" }}>Write a Review</h2>
                  <button type="button" onClick={() => setShowModal(null)} className="p-1 hover:opacity-60" style={{ color: "#0a0a0a" }}>
                    <FiX size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Your Rating</label>
                    <StarSelector value={modalRating} onChange={setModalRating} />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Review Title</label>
                    <input
    type="text"
    placeholder="Summarise your experience"
    value={modalTitle}
    onChange={(e) => setModalTitle(e.target.value)}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a]"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
  />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Your Review</label>
                    <textarea
    rows={4}
    placeholder="Tell us what you loved (or did not love)..."
    value={modalBody}
    onChange={(e) => setModalBody(e.target.value)}
    className="w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:border-[#0a0a0a] resize-none"
    style={{ borderColor: "#f0ebe2", color: "#0a0a0a" }}
  />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c8277" }}>Add Photos (optional)</label>
                    <div
    className="border-2 border-dashed rounded p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#f0ebe2] transition-colors"
    style={{ borderColor: "#c9b99a" }}
  >
                      <FiUpload size={20} style={{ color: "#c9b99a" }} />
                      <p className="text-xs" style={{ color: "#8c8277" }}>Click to upload photos</p>
                    </div>
                  </div>

                  <button
    type="button"
    onClick={handleSubmit}
    className="w-full py-3.5 text-xs tracking-widest uppercase transition-colors"
    style={{ backgroundColor: submitted ? "#2d4a3e" : "#0a0a0a", color: "#fafafa" }}
  >
                    {submitted ? "Review Submitted!" : "Submit Review"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}
export {
  MyReviewsPage as default
};
