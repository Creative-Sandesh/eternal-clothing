import { motion } from "framer-motion";
const sections = [
  {
    title: "Return Window",
    content: `We offer a 30-day return window from the date of delivery. Items must be returned in their original condition: unworn, unwashed, and with all original tags attached. We are unable to accept returns on items that show signs of wear, have been altered, or from which tags have been removed.

Returns must be initiated through your account dashboard or by contacting our client services team at returns@eternal.co within 30 days of delivery. After 30 days, we are unable to accept returns unless the item is faulty.`
  },
  {
    title: "Eligible Items",
    content: `The following items are eligible for return or exchange within our standard return window:

All full-priced clothing, outerwear, and knitwear in original condition.
Footwear, provided it has not been worn outdoors and is returned in the original box.
Accessories (scarves, belts, bags) in original, unused condition.

The following items are excluded from our return policy:

Swimwear, underwear, and intimate apparel for hygiene reasons.
Personalised or monogrammed items.
Items purchased through a third-party retailer.
Gift cards and digital vouchers.

Sale items are eligible for exchange or store credit only, not refund, unless the item is faulty.`
  },
  {
    title: "How to Return",
    content: `Step 1: Initiate your return. Log into your account, navigate to Order History, select the order, and click "Return Items." Alternatively, email returns@eternal.co with your order number.

Step 2: Pack your items. Repack the items securely in the original packaging if possible. Include the returns slip included with your order, or print the returns confirmation sent to your email.

Step 3: Attach your label. A pre-paid returns label will be generated for UK customers. International customers are responsible for return shipping costs.

Step 4: Post your parcel. Drop off at any Post Office or DPD drop-off point. Retain your proof of postage until your return has been processed.

We recommend using a tracked service for all returns. Eternal is not responsible for returns lost in transit without tracking.`
  },
  {
    title: "Refund Timing",
    content: `Once your return is received and inspected, we will process your refund within 3\u20135 business days. You will receive an email confirmation when your refund has been initiated.

Refunds are issued to the original payment method only. Credit and debit card refunds typically take 5\u201310 business days to appear on your statement, depending on your card issuer. PayPal refunds are typically processed within 3\u20135 business days.

Original shipping costs are non-refundable unless the return is the result of our error or a faulty item.`
  },
  {
    title: "Exchanges",
    content: `We offer free exchanges on all full-priced items for a different size or colour, subject to availability. To request an exchange, follow the return initiation process above and select "Exchange" rather than "Refund."

If the size or colour you require is not available, we will issue a full refund to your original payment method.

For urgent exchanges, we recommend purchasing the replacement item separately and returning the original for a full refund, to ensure availability.

To exchange for a different style or at a different price point, please return the original item for a refund and place a new order.`
  }
];
function ReturnPolicyPage() {
  return <div className="bg-[#fafafa] min-h-screen">
      <div className="bg-[#0a0a0a] pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-4"
  >
            Information
          </motion.p>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-6xl text-[#fafafa] leading-none"
  >
            Returns & Exchanges
          </motion.h1>
          <p className="text-[#8c8277] mt-4 text-sm">Last updated: January 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {sections.map((s, i) => <motion.div
    key={s.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i * 0.05 }}
    className="border-t border-[#0a0a0a]/10 pt-8"
  >
              <h2 className="font-display text-2xl text-[#0a0a0a] mb-4">{s.title}</h2>
              <div className="space-y-3">
                {s.content.split("\n\n").map((para, j) => <p key={j} className="text-[#0a0a0a]/70 text-base leading-relaxed">{para}</p>)}
              </div>
            </motion.div>)}
        </div>

        <div className="mt-16 bg-[#f0ebe2] p-8">
          <h3 className="font-display text-xl text-[#0a0a0a] mb-2">Need Assistance?</h3>
          <p className="text-[#8c8277] text-sm leading-relaxed">
            Contact our client services team at{" "}
            <a href="mailto:returns@eternal.co" className="text-[#2d4a3e] underline">returns@eternal.co</a>{" "}
            or call +44 20 7946 0000, Monday–Friday, 9:00 AM–6:00 PM GMT.
          </p>
        </div>
      </div>
    </div>;
}
export {
  ReturnPolicyPage as default
};
