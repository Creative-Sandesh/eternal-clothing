import { motion } from "framer-motion";
const sections = [
  {
    title: "Data We Collect",
    content: `When you create an account or place an order, we collect: your name, email address, postal address, telephone number, and payment information (processed securely by our payment provider and never stored on our servers).

We also collect data about how you interact with our website, including pages visited, items viewed, and search queries. This is collected via cookies and similar tracking technologies (see Cookies section below).

If you contact our client services team, we retain a record of that correspondence.`
  },
  {
    title: "How We Use Your Data",
    content: `We use the data we collect to process and fulfil your orders, communicate with you about your purchases, provide customer support, and send marketing communications if you have opted in.

We analyse aggregated, anonymised browsing data to improve our website, product curation, and user experience. This analysis does not identify you individually.

We will never sell your personal data to third parties. We do not use your data for automated decision-making or profiling that produces legal or similarly significant effects.`
  },
  {
    title: "Cookies",
    content: `We use the following categories of cookies:

Essential cookies: Required for the website to function. These cannot be disabled. They include session cookies that keep you logged in and cart cookies that preserve your shopping basket.

Analytics cookies: Help us understand how visitors use the website. We use these to measure page performance and identify areas for improvement. These are disabled unless you consent.

Marketing cookies: Allow us to show you relevant advertising on other platforms. These are disabled unless you consent.

You can manage your cookie preferences at any time via the Cookie Settings link in the website footer.`
  },
  {
    title: "Third Parties",
    content: `We share data with the following categories of trusted third parties only to the extent necessary to operate our business:

Payment processors (Stripe, PayPal) to process transactions securely.
Delivery partners (Royal Mail, DPD, DHL) to fulfil and track shipments.
Email service providers to send order confirmations and marketing communications.
Analytics providers (Google Analytics) to understand website usage.
Customer service platforms to manage support communications.

All third parties we work with are required to handle your data in accordance with applicable data protection law and our data processing agreements.`
  },
  {
    title: "Your Rights",
    content: `Under the UK GDPR and Data Protection Act 2018, you have the right to:

Access: Request a copy of the personal data we hold about you.
Rectification: Ask us to correct inaccurate or incomplete data.
Erasure: Request that we delete your personal data, subject to certain legal obligations.
Restriction: Ask us to limit how we use your data in certain circumstances.
Portability: Receive your data in a structured, machine-readable format.
Objection: Object to our processing of your data for direct marketing purposes.

To exercise any of these rights, contact our Data Protection Officer at privacy@eternal.co. We will respond within 30 days.`
  },
  {
    title: "Contact",
    content: `Eternal is the data controller for personal data collected through this website. Our registered address is Eternal Ltd, 14 Albemarle Street, London W1S 4HW, United Kingdom.

For privacy-related enquiries, contact our Data Protection Officer at privacy@eternal.co or by post to the above address.

You have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk if you believe your data has been handled unlawfully.`
  }
];
function PrivacyPage() {
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
            Privacy Policy
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
  PrivacyPage as default
};
