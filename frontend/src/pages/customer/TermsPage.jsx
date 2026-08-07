import { motion } from "framer-motion";
const sections = [
  {
    title: "Use of This Website",
    content: `By accessing and using the Eternal website (eternal.co), you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the website immediately.

You may use this website for lawful personal purposes only. You must not use the website in any way that causes, or may cause, damage to the website or impairs its availability, or in any way that is unlawful, fraudulent, or harmful.

You must not use the website to transmit or distribute unsolicited commercial communications, or to collect user data without consent. Automated access (crawling, scraping) requires prior written consent from Eternal.

We reserve the right to restrict access to any part of the website without notice.`
  },
  {
    title: "Purchases & Contracts",
    content: `When you place an order on our website, you are making an offer to purchase goods. Your order is only accepted \u2014 and a contract formed \u2014 when we send you a dispatch confirmation email.

We reserve the right to refuse or cancel any order at our discretion, including in cases of pricing errors, suspected fraud, or unavailability of stock. If we cancel a confirmed order, we will issue a full refund promptly.

All prices on the website are in GBP and include VAT where applicable. We reserve the right to change prices at any time without notice, but changes will not affect orders already confirmed.

Risk in goods passes to you upon delivery. Title passes upon full receipt of payment.`
  },
  {
    title: "Intellectual Property",
    content: `All content on the Eternal website \u2014 including but not limited to text, photographs, graphics, logo designs, video content, and software \u2014 is owned by or licensed to Eternal Ltd and is protected by UK and international copyright law.

You may not reproduce, distribute, modify, or create derivative works from any content on this website without our express written permission, except for personal, non-commercial use.

The Eternal name, wordmark, and associated marks are registered trademarks of Eternal Ltd. Unauthorised use is prohibited.

User-submitted content (including reviews) remains the property of the submitting user, but by submitting content you grant Eternal a worldwide, royalty-free licence to use, reproduce, and display that content in connection with our business.`
  },
  {
    title: "Disclaimers & Liability",
    content: `This website is provided on an "as is" basis. To the fullest extent permitted by law, Eternal makes no warranties, express or implied, regarding the website's availability, accuracy, or fitness for a particular purpose.

We will not be liable for any indirect, incidental, or consequential loss arising from your use of, or inability to use, this website \u2014 including loss of data, revenue, or goodwill.

Our total aggregate liability for any claims arising under or in connection with these Terms shall not exceed the value of your most recent order.

Nothing in these Terms limits or excludes our liability for death or personal injury caused by our negligence, fraud, or fraudulent misrepresentation, or any other liability that cannot be excluded by law.`
  },
  {
    title: "Governing Law",
    content: `These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales. Any dispute arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.

If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity of the remaining provisions.

We reserve the right to update these Terms at any time. Continued use of the website following changes constitutes acceptance of the revised Terms. We recommend reviewing this page periodically.

For any questions regarding these Terms, contact us at legal@eternal.co.`
  }
];
function TermsPage() {
  return <div className="bg-[#fafafa] min-h-screen">
      <div className="bg-[#0a0a0a] pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-4">
            Legal
          </motion.p>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-4xl sm:text-6xl text-[#fafafa] leading-none"
  >
            Terms & Conditions
          </motion.h1>
          <p className="text-[#8c8277] mt-4 text-sm">Last updated: January 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-12">
          {sections.map((s, i) => <motion.div
    key={s.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i * 0.05 }}
    className="border-t border-[#0a0a0a]/10 pt-8"
  >
              <h2 className="font-display text-xl sm:text-2xl text-[#0a0a0a] mb-4">{s.title}</h2>
              <div className="space-y-3">
                {s.content.split("\n\n").map((para, j) => <p key={j} className="text-[#0a0a0a]/70 text-base leading-relaxed">{para}</p>)}
              </div>
            </motion.div>)}
        </div>
      </div>
    </div>;
}
export {
  TermsPage as default
};
