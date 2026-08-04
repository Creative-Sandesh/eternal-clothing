import { motion } from "framer-motion";
const sections = [
  {
    title: "Processing Times",
    content: `All orders are processed within 1\u20132 business days of receipt (Monday through Friday, excluding UK public holidays). Orders placed after 2:00 PM GMT will begin processing the following business day. You will receive an order confirmation email immediately upon purchase, and a dispatch confirmation with tracking information once your order has been collected by our courier.

During peak periods \u2014 including sale events, new collection launches, and the December holiday season \u2014 processing times may extend to 2\u20133 business days. We will communicate any delays via email.`
  },
  {
    title: "Domestic Shipping (United Kingdom)",
    content: `Standard Delivery: 2\u20134 business days \xB7 Free on all orders over \xA3150, or \xA34.95 for orders below.

Named Day Delivery: Select your preferred delivery date at checkout \xB7 \xA37.95.

Saturday Delivery: Order by 12:00 PM Friday \xB7 \xA39.95.

All domestic shipments are sent via Royal Mail Tracked or DPD depending on parcel weight. A signature may be required upon delivery. If you are not available, the courier will attempt redelivery or leave a card with collection instructions.`
  },
  {
    title: "International Shipping",
    content: `We ship to over 40 countries worldwide. Delivery timescales and costs vary by destination.

Europe (EU): 3\u20137 business days \xB7 \xA312.95 standard, \xA319.95 express.
United States & Canada: 5\u201310 business days \xB7 \xA318.95 standard, \xA329.95 express.
Rest of World: 7\u201314 business days \xB7 \xA322.95 standard, \xA339.95 express.

International customers are responsible for any customs duties, import taxes, or brokerage fees levied by the destination country. Eternal is not responsible for delays caused by customs processing. Shipping times are estimates and cannot be guaranteed.`
  },
  {
    title: "Express & Next-Day Options",
    content: `Next-Day Delivery (UK only): Order before 1:00 PM Monday\u2013Thursday for guaranteed next-business-day delivery \xB7 \xA312.95. Orders placed on Friday will arrive Monday.

Same-Day London: Available for selected Central London postcodes. Order before 10:00 AM for delivery between 5:00 PM and 9:00 PM the same day \xB7 \xA324.95. Contact our client services team to confirm availability for your postcode.

International Express: DHL Express 1\u20133 business days to most international destinations. Prices calculated at checkout based on destination and parcel weight.`
  },
  {
    title: "Order Tracking",
    content: `Once your order has been dispatched, you will receive a confirmation email containing your tracking number and a link to the relevant courier's tracking portal. You can also track your order by visiting your account dashboard and navigating to Order History.

If your tracking information has not updated within 48 hours of dispatch, please contact our client services team at shipping@eternal.co with your order number. We will investigate with the courier on your behalf.

Please note that tracking information may take up to 24 hours to appear after the dispatch confirmation email is sent.`
  }
];
function ShippingPolicyPage() {
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
            Shipping Policy
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
          <h3 className="font-display text-xl text-[#0a0a0a] mb-2">Need Help?</h3>
          <p className="text-[#8c8277] text-sm leading-relaxed">
            Our client services team is available Monday–Friday, 9:00 AM–6:00 PM GMT. Contact us at{" "}
            <a href="mailto:shipping@eternal.co" className="text-[#2d4a3e] underline">shipping@eternal.co</a>{" "}
            or via the contact form on our website.
          </p>
        </div>
      </div>
    </div>;
}
export {
  ShippingPolicyPage as default
};
