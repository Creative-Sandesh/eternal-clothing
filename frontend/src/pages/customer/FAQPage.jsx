import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
const faqs = [
  { q: "What is your return policy?", a: "We offer a 30-day return window on all full-priced items. Items must be returned in original, unworn condition with all tags attached. Sale items are eligible for exchange or store credit only." },
  { q: "How long does delivery take?", a: "Standard UK delivery takes 2\u20134 business days. International orders typically arrive within 5\u201314 business days depending on destination. Express options are available at checkout." },
  { q: "Do you offer international shipping?", a: "Yes, we ship to over 40 countries worldwide. International shipping rates and estimated delivery times are calculated at checkout. Please note that customs duties may apply." },
  { q: "How do I care for my Eternal pieces?", a: "Care instructions are printed on each garment label and detailed on the product page. As a general rule, we recommend cold machine wash or dry clean for structured garments, and to lay knitwear flat to dry." },
  { q: "Can I change or cancel my order?", a: "Orders can be amended or cancelled within 1 hour of placement by contacting our client services team. Once dispatched, orders cannot be cancelled but can be returned per our returns policy." },
  { q: "Do you offer gift wrapping?", a: "Yes. All Eternal orders are beautifully packaged in our signature tissue and box. Gift wrapping with a handwritten message card can be selected at checkout at no additional charge." },
  { q: "How do I find my size?", a: "Each product page includes a detailed size guide with measurements. If you are between sizes, we generally recommend sizing up for outerwear and knitwear, and down for tailored pieces." },
  { q: "Do you have a loyalty programme?", a: "Yes, Eternal Atelier is our loyalty programme. You earn points on every purchase, which can be redeemed for discounts. Access your loyalty dashboard from your account page." }
];
function FAQPage() {
  const [open, setOpen] = useState(null);
  return <div className="bg-[#fafafa] min-h-screen">
      <div className="bg-[#0a0a0a] pt-28 pb-16 px-6 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-4">Help</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display text-6xl md:text-8xl text-[#fafafa] leading-none">
          FAQ
        </motion.h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-2">
          {faqs.map((faq, i) => <div key={i} className="border-b border-[#0a0a0a]/10">
              <button
    onClick={() => setOpen(open === i ? null : i)}
    className="w-full flex items-center justify-between py-5 text-left gap-4"
  >
                <span className="text-[#0a0a0a] font-medium text-base">{faq.q}</span>
                {open === i ? <FiMinus className="w-4 h-4 text-[#2d4a3e] flex-shrink-0" /> : <FiPlus className="w-4 h-4 text-[#8c8277] flex-shrink-0" />}
              </button>
              <AnimatePresence>
                {open === i && <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="overflow-hidden"
  >
                    <p className="text-[#8c8277] text-sm leading-relaxed pb-5">{faq.a}</p>
                  </motion.div>}
              </AnimatePresence>
            </div>)}
        </div>
      </div>
    </div>;
}
export {
  FAQPage as default
};
