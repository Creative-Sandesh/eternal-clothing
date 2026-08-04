import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiChevronRight, FiLock, FiPackage, FiCreditCard, FiMapPin } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
const STEPS = [
  { number: 1, label: "Contact", icon: FiCheck },
  { number: 2, label: "Shipping", icon: FiMapPin },
  { number: 3, label: "Payment", icon: FiCreditCard },
  { number: 4, label: "Review", icon: FiPackage }
];
const COUNTRIES = [
  "United Kingdom",
  "United States",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Australia",
  "Canada",
  "Japan"
];
function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    newsletter: false,
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    shippingMethod: "standard",
    cardNumber: "",
    expiry: "",
    cvv: "",
    nameOnCard: "",
    billingSameAsShipping: true,
    billingAddress: "",
    billingCity: "",
    billingPostcode: "",
    agreedToTerms: false
  });
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const shippingCost = form.shippingMethod === "express" ? 12 : form.shippingMethod === "nextday" ? 25 : total >= 200 ? 0 : 8;
  const displayTotal = items.length > 0 ? total : 405;
  const tax = displayTotal * 0.2;
  const grandTotal = displayTotal + shippingCost + tax;
  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  }
  function maskedCard() {
    const raw = form.cardNumber.replace(/\s/g, "");
    if (raw.length < 4) return form.cardNumber || "\u25CF\u25CF\u25CF\u25CF \u25CF\u25CF\u25CF\u25CF \u25CF\u25CF\u25CF\u25CF ____";
    const last4 = raw.slice(-4);
    return `\u25CF\u25CF\u25CF\u25CF \u25CF\u25CF\u25CF\u25CF \u25CF\u25CF\u25CF\u25CF ${last4}`;
  }
  function handlePlaceOrder() {
    clearCart();
    navigate("/order-confirmation");
  }
  const inputClass = "w-full border-b border-eternal-stone bg-transparent py-3 text-sm outline-none focus:border-eternal-black transition-colors placeholder:text-eternal-stone/60";
  const labelClass = "block text-xs font-medium tracking-widest uppercase text-eternal-stone mb-2";
  return <div className="min-h-screen bg-eternal-white text-eternal-black">
      {
    /* Header */
  }
      <header className="border-b border-eternal-stone/20 px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-widest uppercase">
            Eternal
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-eternal-stone">
            <FiLock size={12} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:grid lg:grid-cols-12 lg:gap-12">
        {
    /* Left — Form */
  }
        <div className="lg:col-span-7">
          {
    /* Progress Bar */
  }
          <div className="mb-10 flex items-center">
            {STEPS.map((step, idx) => <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
    className={[
      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-all",
      currentStep > step.number ? "bg-eternal-green border-eternal-green text-eternal-white" : currentStep === step.number ? "border-eternal-black text-eternal-black bg-transparent" : "border-eternal-stone text-eternal-stone bg-transparent"
    ].join(" ")}
  >
                    {currentStep > step.number ? <FiCheck size={13} /> : step.number}
                  </div>
                  <span
    className={[
      "text-xs tracking-wide",
      currentStep >= step.number ? "text-eternal-black" : "text-eternal-stone"
    ].join(" ")}
  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && <div
    className={[
      "h-px flex-1 mx-2 mb-5 transition-colors",
      currentStep > step.number ? "bg-eternal-green" : "bg-eternal-stone/30"
    ].join(" ")}
  />}
              </div>)}
          </div>

          {
    /* Animated Step Content */
  }
          <AnimatePresence mode="wait">
            <motion.div
    key={currentStep}
    initial={{ x: 30, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -30, opacity: 0 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
  >
              {
    /* Step 1 — Contact */
  }
              {currentStep === 1 && <div>
                  <h2 className="font-display text-2xl mb-6">Contact Details</h2>
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Email address</label>
                      <input
    type="email"
    className={inputClass}
    placeholder="your@email.com"
    value={form.email}
    onChange={(e) => updateForm("email", e.target.value)}
  />
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div
    className={[
      "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center border transition-colors",
      form.newsletter ? "bg-eternal-black border-eternal-black" : "border-eternal-stone bg-transparent"
    ].join(" ")}
    onClick={() => updateForm("newsletter", !form.newsletter)}
  >
                        {form.newsletter && <FiCheck size={10} className="text-eternal-white" />}
                      </div>
                      <span className="text-sm text-eternal-stone leading-snug">
                        Subscribe to our newsletter for early access and exclusive offers
                      </span>
                    </label>
                    <p className="text-xs text-eternal-stone">
                      Already have an account?{" "}
                      <Link to="/login" className="underline text-eternal-black">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>}

              {
    /* Step 2 — Shipping */
  }
              {currentStep === 2 && <div>
                  <h2 className="font-display text-2xl mb-6">Shipping Details</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>First Name</label>
                        <input
    type="text"
    className={inputClass}
    placeholder="Jane"
    value={form.firstName}
    onChange={(e) => updateForm("firstName", e.target.value)}
  />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name</label>
                        <input
    type="text"
    className={inputClass}
    placeholder="Smith"
    value={form.lastName}
    onChange={(e) => updateForm("lastName", e.target.value)}
  />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Address</label>
                      <input
    type="text"
    className={inputClass}
    placeholder="12 Mayfair Lane"
    value={form.address}
    onChange={(e) => updateForm("address", e.target.value)}
  />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>City</label>
                        <input
    type="text"
    className={inputClass}
    placeholder="London"
    value={form.city}
    onChange={(e) => updateForm("city", e.target.value)}
  />
                      </div>
                      <div>
                        <label className={labelClass}>Postcode</label>
                        <input
    type="text"
    className={inputClass}
    placeholder="W1K 1AB"
    value={form.postcode}
    onChange={(e) => updateForm("postcode", e.target.value)}
  />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <select
    className={inputClass + " cursor-pointer"}
    value={form.country}
    onChange={(e) => updateForm("country", e.target.value)}
  >
                        {COUNTRIES.map((c) => <option key={c} value={c}>
                            {c}
                          </option>)}
                      </select>
                    </div>

                    {
    /* Shipping Method */
  }
                    <div className="mt-8">
                      <p className={labelClass + " mb-4"}>Shipping Method</p>
                      <div className="space-y-3">
                        {[
    {
      id: "standard",
      label: "Standard",
      price: "Free",
      detail: "3\u20135 working days"
    },
    {
      id: "express",
      label: "Express",
      price: "\xA312.00",
      detail: "1\u20132 working days"
    },
    {
      id: "nextday",
      label: "Next Day",
      price: "\xA325.00",
      detail: "Order before 2pm"
    }
  ].map((option) => <button
    key={option.id}
    type="button"
    onClick={() => updateForm("shippingMethod", option.id)}
    className={[
      "w-full border p-4 text-left transition-colors",
      form.shippingMethod === option.id ? "border-eternal-black bg-eternal-beige" : "border-eternal-stone/30 bg-transparent hover:border-eternal-stone"
    ].join(" ")}
  >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
    className={[
      "h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0",
      form.shippingMethod === option.id ? "border-eternal-black" : "border-eternal-stone"
    ].join(" ")}
  >
                                  {form.shippingMethod === option.id && <div className="h-2 w-2 rounded-full bg-eternal-black" />}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{option.label}</p>
                                  <p className="text-xs text-eternal-stone mt-0.5">{option.detail}</p>
                                </div>
                              </div>
                              <span className="text-sm font-medium">{option.price}</span>
                            </div>
                          </button>)}
                      </div>
                    </div>
                  </div>
                </div>}

              {
    /* Step 3 — Payment */
  }
              {currentStep === 3 && <div>
                  <h2 className="font-display text-2xl mb-6">Payment Details</h2>
                  <div className="flex items-center gap-1.5 text-xs text-eternal-stone mb-6">
                    <FiLock size={12} />
                    <span>Secure, encrypted payment</span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Name on Card</label>
                      <input
    type="text"
    className={inputClass}
    placeholder="Jane Smith"
    value={form.nameOnCard}
    onChange={(e) => updateForm("nameOnCard", e.target.value)}
  />
                    </div>
                    <div>
                      <label className={labelClass}>Card Number</label>
                      <input
    type="text"
    className={inputClass}
    placeholder="●●●● ●●●● ●●●● ●●●●"
    value={form.cardNumber}
    maxLength={19}
    onChange={(e) => updateForm("cardNumber", formatCardNumber(e.target.value))}
    inputMode="numeric"
  />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Expiry (MM/YY)</label>
                        <input
    type="text"
    className={inputClass}
    placeholder="MM/YY"
    value={form.expiry}
    maxLength={5}
    onChange={(e) => updateForm("expiry", formatExpiry(e.target.value))}
    inputMode="numeric"
  />
                      </div>
                      <div>
                        <label className={labelClass}>CVV</label>
                        <input
    type="password"
    className={inputClass}
    placeholder="•••"
    value={form.cvv}
    maxLength={4}
    onChange={(e) => updateForm("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
    inputMode="numeric"
  />
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer mt-4">
                      <div
    className={[
      "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center border transition-colors",
      form.billingSameAsShipping ? "bg-eternal-black border-eternal-black" : "border-eternal-stone bg-transparent"
    ].join(" ")}
    onClick={() => updateForm("billingSameAsShipping", !form.billingSameAsShipping)}
  >
                        {form.billingSameAsShipping && <FiCheck size={10} className="text-eternal-white" />}
                      </div>
                      <span className="text-sm text-eternal-stone leading-snug">
                        Billing address same as shipping address
                      </span>
                    </label>

                    {!form.billingSameAsShipping && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="space-y-6 overflow-hidden"
  >
                        <div>
                          <label className={labelClass}>Billing Address</label>
                          <input
    type="text"
    className={inputClass}
    placeholder="12 Billing Street"
    value={form.billingAddress}
    onChange={(e) => updateForm("billingAddress", e.target.value)}
  />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>City</label>
                            <input
    type="text"
    className={inputClass}
    placeholder="London"
    value={form.billingCity}
    onChange={(e) => updateForm("billingCity", e.target.value)}
  />
                          </div>
                          <div>
                            <label className={labelClass}>Postcode</label>
                            <input
    type="text"
    className={inputClass}
    placeholder="W1K 1AB"
    value={form.billingPostcode}
    onChange={(e) => updateForm("billingPostcode", e.target.value)}
  />
                          </div>
                        </div>
                      </motion.div>}
                  </div>
                </div>}

              {
    /* Step 4 — Review */
  }
              {currentStep === 4 && <div>
                  <h2 className="font-display text-2xl mb-6">Review Your Order</h2>
                  <div className="divide-y divide-eternal-stone/20 border-y border-eternal-stone/20">
                    {
    /* Contact review */
  }
                    <div className="py-4 flex items-start justify-between">
                      <div>
                        <p className={labelClass + " mb-1"}>Contact</p>
                        <p className="text-sm">{form.email || "Not provided"}</p>
                      </div>
                      <button
    onClick={() => setCurrentStep(1)}
    className="text-xs text-eternal-stone underline underline-offset-2 flex-shrink-0 ml-4 mt-1"
  >
                        Edit
                      </button>
                    </div>

                    {
    /* Shipping review */
  }
                    <div className="py-4 flex items-start justify-between">
                      <div>
                        <p className={labelClass + " mb-1"}>Shipping</p>
                        <p className="text-sm">
                          {[form.firstName, form.lastName].filter(Boolean).join(" ") || "Not provided"}
                        </p>
                        {form.address && <p className="text-sm text-eternal-stone">
                            {form.address}, {form.city} {form.postcode}
                          </p>}
                        <p className="text-xs text-eternal-stone mt-1 capitalize">
                          {form.shippingMethod === "standard" ? "Standard \u2014 Free (3\u20135 working days)" : form.shippingMethod === "express" ? "Express \u2014 \xA312.00 (1\u20132 working days)" : "Next Day \u2014 \xA325.00 (Order before 2pm)"}
                        </p>
                      </div>
                      <button
    onClick={() => setCurrentStep(2)}
    className="text-xs text-eternal-stone underline underline-offset-2 flex-shrink-0 ml-4 mt-1"
  >
                        Edit
                      </button>
                    </div>

                    {
    /* Payment review */
  }
                    <div className="py-4 flex items-start justify-between">
                      <div>
                        <p className={labelClass + " mb-1"}>Payment</p>
                        <p className="text-sm font-mono tracking-wider">{maskedCard()}</p>
                      </div>
                      <button
    onClick={() => setCurrentStep(3)}
    className="text-xs text-eternal-stone underline underline-offset-2 flex-shrink-0 ml-4 mt-1"
  >
                        Edit
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer mt-6">
                    <div
    className={[
      "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center border transition-colors",
      form.agreedToTerms ? "bg-eternal-black border-eternal-black" : "border-eternal-stone bg-transparent"
    ].join(" ")}
    onClick={() => updateForm("agreedToTerms", !form.agreedToTerms)}
  >
                      {form.agreedToTerms && <FiCheck size={10} className="text-eternal-white" />}
                    </div>
                    <span className="text-sm text-eternal-stone leading-snug">
                      I agree to the{" "}
                      <Link to="/terms" className="underline text-eternal-black">
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="underline text-eternal-black">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <button
    onClick={handlePlaceOrder}
    disabled={!form.agreedToTerms}
    className="mt-6 w-full bg-eternal-black text-eternal-white py-4 text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
  >
                    Place Order
                  </button>
                </div>}

              {
    /* Navigation */
  }
              <div className="mt-8 flex items-center justify-between">
                {currentStep > 1 ? <button
    onClick={() => setCurrentStep((s) => s - 1)}
    className="text-sm text-eternal-stone underline underline-offset-2"
  >
                    Back
                  </button> : <div />}
                {currentStep < 4 && <button
    onClick={() => setCurrentStep((s) => s + 1)}
    className="bg-eternal-black text-eternal-white px-8 py-4 text-sm tracking-widest uppercase flex items-center gap-2 hover:bg-eternal-green transition-colors"
  >
                    Continue
                    <FiChevronRight size={14} />
                  </button>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {
    /* Right — Order Summary */
  }
        <div className="mt-12 lg:mt-0 lg:col-span-5">
          <div className="sticky top-8 bg-eternal-beige p-6">
            <h3 className="font-display text-xl mb-4">Order Summary</h3>

            <div className="space-y-4 mb-6">
              {items.length > 0 ? items.map((item) => <div key={item.id} className="flex gap-4">
                    <div className="w-[60px] h-[80px] bg-eternal-stone/20 flex-shrink-0 overflow-hidden">
                      {item.image && <img
    src={item.image}
    alt={item.name}
    className="w-full h-full object-cover"
  />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{item.name}</p>
                      <p className="text-xs text-eternal-stone mt-0.5">
                        {item.size && `${item.size}`}
                        {item.color && ` / ${item.color}`}
                      </p>
                      <p className="text-xs text-eternal-stone">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium flex-shrink-0">
                      £{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                    </p>
                  </div>) : <>
                  <div className="flex gap-4">
                    <div className="w-[60px] h-[80px] bg-eternal-stone/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        Oversized Cotton Poplin Shirt
                      </p>
                      <p className="text-xs text-eternal-stone mt-0.5">M / Chalk White</p>
                      <p className="text-xs text-eternal-stone">Qty: 1</p>
                    </div>
                    <p className="text-sm font-medium flex-shrink-0">£185</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-[60px] h-[80px] bg-eternal-stone/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">Merino Crewneck Knit</p>
                      <p className="text-xs text-eternal-stone mt-0.5">S / Ivory</p>
                      <p className="text-xs text-eternal-stone">Qty: 1</p>
                    </div>
                    <p className="text-sm font-medium flex-shrink-0">£220</p>
                  </div>
                </>}
            </div>

            <div className="border-t border-eternal-stone/20 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-eternal-stone">Subtotal</span>
                <span>£{displayTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-eternal-stone">Shipping</span>
                <span>
                  {shippingCost === 0 ? "Free" : `\xA3${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-eternal-stone">Tax (20% VAT)</span>
                <span>£{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t border-eternal-stone/20 pt-3 mt-3">
                <span>Total</span>
                <span>£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs text-eternal-stone">
              <FiLock size={12} />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export {
  CheckoutPage as default
};
