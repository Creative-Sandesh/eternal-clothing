import { useState, useEffect } from "react";
import { useMoney, useSettings } from "../../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiChevronRight, FiLock, FiPackage, FiCreditCard, FiMapPin, FiTag, FiLoader } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { addressApi, couponApi, orderApi, paymentMethodApi, marketingApi } from "../../services/api";

const PROVIDERS = [
  { value: "CARD", label: "Credit / Debit Card" },
  { value: "ESEWA", label: "eSewa" },
  { value: "KHALTI", label: "Khalti" },
  { value: "COD", label: "Cash on Delivery" },
];
const STEPS = [
  { number: 1, label: "Contact", icon: FiCheck },
  { number: 2, label: "Shipping", icon: FiMapPin },
  { number: 3, label: "Payment", icon: FiCreditCard },
  { number: 4, label: "Review", icon: FiPackage }
];
const COUNTRIES = [
  "Nepal",
  "India",
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
  const money = useMoney();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    newsletter: false,
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    country: "Nepal",
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
  // Address & coupon state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [stepError, setStepError] = useState("");

  // Payment
  const [paymentProvider, setPaymentProvider] = useState("CARD");
  const [savedMethods, setSavedMethods] = useState([]);
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Load saved payment methods for logged-in users
  useEffect(() => {
    if (!user) return;
    paymentMethodApi.getAll().then((res) => {
      const list = res.data || [];
      setSavedMethods(list);
      const def = list.find((m) => m.isDefault) || list[0];
      if (def) {
        setSelectedSavedMethodId(def.id);
        setPaymentProvider(def.type);
      }
    }).catch(() => {});
  }, [user]);

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (user) {
      addressApi
        .getAll()
        .then((res) => {
          const addrs = res.data ?? [];
          setSavedAddresses(addrs);
          if (addrs.length > 0) {
            const def = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(def.id);
            setForm((prev) => ({
              ...prev,
              firstName: def.firstName || prev.firstName,
              lastName: def.lastName || prev.lastName,
              address: def.addressLine1 || prev.address,
              city: def.city || prev.city,
              postcode: def.postalCode || prev.postcode,
              country: def.country || prev.country
            }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Estimate only — the backend recomputes shipping and tax from store settings on checkout.
  const { settings, freeShippingThreshold, shippingFee } = useSettings();
  const taxRatePercent = Number(settings.tax_rate_percent) || 0;
  const displayTotal = items.length > 0 ? total : 0;
  const shippingCost = displayTotal === 0 || (freeShippingThreshold > 0 && displayTotal >= freeShippingThreshold) ? 0 : shippingFee;
  const tax = displayTotal * (taxRatePercent / 100);
  const grandTotal = displayTotal + shippingCost + tax - couponDiscount;

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Validate the current step before advancing. Guests must provide contact +
  // address details up front since there are no saved addresses to fall back on.
  function goNext() {
    setStepError("");
    if (currentStep === 1 && (!form.email || !form.email.includes("@"))) {
      setStepError("Enter a valid email address to continue.");
      return;
    }
    if (currentStep === 2) {
      const manualEntry = !user || selectedAddressId === null;
      if (manualEntry && (!form.address.trim() || !form.city.trim() || !form.postcode.trim())) {
        setStepError("Enter your address, city and postcode.");
        return;
      }
    }
    if (currentStep === 3 && !form.billingSameAsShipping) {
      if (!form.billingAddress.trim() || !form.billingCity.trim() || !form.billingPostcode.trim()) {
        setStepError("Enter your billing address, or tick “same as shipping”.");
        return;
      }
    }
    setCurrentStep((s) => s + 1);
  }
  function goBack() {
    setStepError("");
    setCurrentStep((s) => s - 1);
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

  // Apply coupon code via backend
  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await couponApi.validate(couponCode.trim(), displayTotal);
      const discount = res.data?.discountAmount ?? 0;
      setCouponDiscount(discount);
      setAppliedCoupon(couponCode.trim());
      setCouponError("");
    } catch (err) {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      setCouponError(err.message || "Invalid or expired coupon code.");
    } finally {
      setCouponLoading(false);
    }
  }

  // Place order via backend
  async function handlePlaceOrder() {
    if (!form.agreedToTerms) return;
    setOrderLoading(true);
    setOrderError("");
    try {
      // Map cart items to backend format
      const orderItems = items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity
      })).filter((i) => i.productVariantId);

      if (orderItems.length === 0) {
        setOrderError("No valid items with variant info found. Please re-add items from the product page.");
        setOrderLoading(false);
        return;
      }

      const payload = {
        items: orderItems,
        couponCode: appliedCoupon || undefined,
      };

      if (user) {
        // ── Account checkout: reference / create saved Address rows ──
        let shippingAddressId = selectedAddressId;
        let billingAddressId = selectedAddressId;

        if (!shippingAddressId) {
          const newAddr = await addressApi.create({
            firstName: form.firstName,
            lastName: form.lastName,
            addressLine1: form.address,
            city: form.city,
            postalCode: form.postcode,
            country: form.country,
            isDefault: false
          });
          shippingAddressId = newAddr.data?.id;
          billingAddressId = shippingAddressId;
        }

        if (!form.billingSameAsShipping) {
          const billingAddr = await addressApi.create({
            firstName: form.firstName,
            lastName: form.lastName,
            addressLine1: form.billingAddress,
            city: form.billingCity,
            postalCode: form.billingPostcode,
            country: form.country,
            isDefault: false
          });
          billingAddressId = billingAddr.data?.id;
        }

        payload.shippingAddressId = shippingAddressId;
        payload.billingAddressId = billingAddressId;
      } else {
        // ── Guest checkout: send the addresses inline + a contact email ──
        if (!form.email || !form.email.includes("@")) {
          setOrderError("Enter a valid email address in the Contact step.");
          setCurrentStep(1);
          return;
        }
        const shipping = {
          addressLine1: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postcode.trim(),
          country: form.country,
        };
        if (!shipping.addressLine1 || !shipping.city || !shipping.postalCode) {
          setOrderError("Enter your full shipping address.");
          setCurrentStep(2);
          return;
        }
        payload.guestEmail = form.email.trim();
        payload.shippingAddress = shipping;
        payload.billingAddress = form.billingSameAsShipping
          ? shipping
          : {
              addressLine1: form.billingAddress.trim(),
              city: form.billingCity.trim(),
              postalCode: form.billingPostcode.trim(),
              country: form.country,
            };
      }

      // Use a saved method if the selected radio maps to one, else the raw provider.
      const savedMatch = savedMethods.find((m) => m.id === selectedSavedMethodId && m.type === paymentProvider);
      if (savedMatch && user) payload.savedPaymentMethodId = savedMatch.id;
      else payload.provider = paymentProvider;

      const res = await orderApi.checkout(payload);
      const order = res.data?.order;
      const orderId = order?.id;
      const guestEmail = user ? undefined : form.email.trim();

      // Opt into the newsletter if requested.
      if (form.newsletter && form.email) {
        marketingApi.subscribe(form.email, "CHECKOUT").catch(() => {});
      }

      clearCart();

      if (res.data?.requiresPayment) {
        const rp = res.data.redirect?.redirect;
        if (rp?.method === "POST" && rp.url && !res.data.redirect?.sandbox) {
          // Real gateway (eSewa) — the redirect back loses React state, so stash
          // what the confirmation page needs to verify the payment.
          try {
            sessionStorage.setItem(
              "eternal_pending_verify",
              JSON.stringify({ orderId, provider: paymentProvider, guestEmail })
            );
          } catch { /* private mode — the confirmation page still has the query params */ }
          const f = document.createElement("form");
          f.method = "POST";
          f.action = rp.url;
          Object.entries(rp.fields || {}).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden"; input.name = k; input.value = String(v);
            f.appendChild(input);
          });
          document.body.appendChild(f);
          f.submit();
          return;
        }
        // Sandbox / no keys — confirm on the confirmation page.
        navigate("/order-confirmation", { state: { orderId, order, provider: paymentProvider, verify: true, guestEmail } });
        return;
      }

      navigate("/order-confirmation", { state: { orderId, order } });
    } catch (err) {
      setOrderError(err.message || "Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
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
                  {!user && (
                    <p className="text-sm text-eternal-stone mb-6 -mt-2">
                      Checking out as a guest. We'll email your order confirmation and updates to this address.
                    </p>
                  )}
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
                    {!user && (
                      <p className="text-xs text-eternal-stone">
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          state={{ from: { pathname: "/checkout" } }}
                          className="underline text-eternal-black"
                        >
                          Sign in
                        </Link>{" "}
                        for saved addresses, faster checkout and loyalty points.
                      </p>
                    )}
                  </div>
                </div>}

              {
    /* Step 2 — Shipping */
  }
              {currentStep === 2 && (
                <div>
                  {/* Saved Addresses - only for logged-in users with existing addresses */}
                  {user && savedAddresses.length > 0 && (
                    <div className="mb-8">
                      <p className={labelClass + " mb-4"}>Saved Addresses</p>
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setForm((prev) => ({
                                ...prev,
                                firstName: addr.firstName || prev.firstName,
                                lastName: addr.lastName || prev.lastName,
                                address: addr.addressLine1 || prev.address,
                                city: addr.city || prev.city,
                                postcode: addr.postalCode || prev.postcode,
                                country: addr.country || prev.country
                              }));
                            }}
                            className={[
                              "w-full text-left border p-4 text-sm transition-colors",
                              selectedAddressId === addr.id
                                ? "border-eternal-black bg-eternal-beige"
                                : "border-eternal-stone/30 hover:border-eternal-stone"
                            ].join(" ")}
                          >
                            <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                            <p className="text-eternal-stone text-xs mt-0.5">
                              {addr.addressLine1}, {addr.city} {addr.postalCode}, {addr.country}
                            </p>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedAddressId(null)}
                          className={[
                            "w-full text-left border p-4 text-sm transition-colors",
                            selectedAddressId === null
                              ? "border-eternal-black bg-eternal-beige"
                              : "border-eternal-stone/30 hover:border-eternal-stone"
                          ].join(" ")}
                        >
                          + Enter a new address
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual address fields: always shown for guests; shown for logged-in only when entering a new address */}
                  {(!user || selectedAddressId === null) && (
                    <div>
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
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Method */}
                  <div className="mt-8">
                    <p className={labelClass + " mb-4"}>Shipping Method</p>
                    <div className="w-full border border-eternal-black bg-eternal-beige p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Standard Delivery</p>
                          <p className="text-xs text-eternal-stone mt-0.5">3–5 working days</p>
                        </div>
                        <span className="text-sm font-medium">{shippingCost === 0 ? "Free" : money(shippingCost)}</span>
                      </div>
                      {freeShippingThreshold > 0 && shippingCost > 0 && (
                        <p className="text-xs text-eternal-stone mt-2">Free over {money(freeShippingThreshold)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {
    /* Step 3 — Payment */
  }
              {currentStep === 3 && <div>
                  <h2 className="font-display text-2xl mb-6">Payment Method</h2>
                  <div className="flex items-center gap-1.5 text-xs text-eternal-stone mb-6">
                    <FiLock size={12} />
                    <span>Secure, encrypted payment</span>
                  </div>
                  <div className="space-y-4">
                    {/* Saved methods */}
                    {savedMethods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setSelectedSavedMethodId(m.id); setPaymentProvider(m.type); }}
                        className={[
                          "w-full border p-4 text-left text-sm transition-colors flex items-center justify-between",
                          selectedSavedMethodId === m.id ? "border-eternal-black bg-eternal-beige" : "border-eternal-stone/30 hover:border-eternal-stone"
                        ].join(" ")}
                      >
                        <span className="font-medium">{m.label}</span>
                        <span className="text-xs text-eternal-stone">{m.type}{m.isDefault ? " · default" : ""}</span>
                      </button>
                    ))}

                    {/* Provider choices */}
                    <p className={labelClass + " pt-2"}>{savedMethods.length ? "Or pay another way" : "Choose a payment method"}</p>
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => { setPaymentProvider(p.value); setSelectedSavedMethodId(null); }}
                        className={[
                          "w-full border p-4 text-left text-sm transition-colors flex items-center gap-3",
                          paymentProvider === p.value && !selectedSavedMethodId ? "border-eternal-black bg-eternal-beige" : "border-eternal-stone/30 hover:border-eternal-stone"
                        ].join(" ")}
                      >
                        <span className={[
                          "h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0",
                          paymentProvider === p.value && !selectedSavedMethodId ? "border-eternal-black" : "border-eternal-stone"
                        ].join(" ")}>
                          {paymentProvider === p.value && !selectedSavedMethodId && <span className="h-2 w-2 rounded-full bg-eternal-black" />}
                        </span>
                        {p.label}
                      </button>
                    ))}

                    {/* Card fields only for a fresh card */}
                    {paymentProvider === "CARD" && !selectedSavedMethodId && (
                      <div className="space-y-6 pt-2">
                        <div>
                          <label className={labelClass}>Name on Card</label>
                          <input type="text" className={inputClass} placeholder="Jane Smith" value={form.nameOnCard} onChange={(e) => updateForm("nameOnCard", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Card Number</label>
                          <input type="text" className={inputClass} placeholder="●●●● ●●●● ●●●● ●●●●" value={form.cardNumber} maxLength={19} onChange={(e) => updateForm("cardNumber", formatCardNumber(e.target.value))} inputMode="numeric" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Expiry (MM/YY)</label>
                            <input type="text" className={inputClass} placeholder="MM/YY" value={form.expiry} maxLength={5} onChange={(e) => updateForm("expiry", formatExpiry(e.target.value))} inputMode="numeric" />
                          </div>
                          <div>
                            <label className={labelClass}>CVV</label>
                            <input type="password" className={inputClass} placeholder="•••" value={form.cvv} maxLength={4} onChange={(e) => updateForm("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
                          </div>
                        </div>
                      </div>
                    )}

                    {(paymentProvider === "ESEWA" || paymentProvider === "KHALTI") && !selectedSavedMethodId && (
                      <p className="text-xs text-eternal-stone pt-1">You'll be taken to {paymentProvider === "ESEWA" ? "eSewa" : "Khalti"} to complete payment after placing the order.</p>
                    )}
                    {paymentProvider === "COD" && (
                      <p className="text-xs text-eternal-stone pt-1">Pay in cash when your order is delivered.</p>
                    )}

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
                        <p className="text-xs text-eternal-stone mt-1">
                          {`Standard \u2014 ${shippingCost === 0 ? "Free" : money(shippingCost)} (3\u20135 working days)`}
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
                        <p className="text-sm">
                          {selectedSavedMethodId
                            ? savedMethods.find((m) => m.id === selectedSavedMethodId)?.label
                            : paymentProvider === "CARD"
                              ? maskedCard()
                              : PROVIDERS.find((p) => p.value === paymentProvider)?.label}
                        </p>
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

                  {orderError && (
                    <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                      {orderError}
                    </p>
                  )}
                  <button
    onClick={handlePlaceOrder}
    disabled={!form.agreedToTerms || orderLoading}
    className="mt-6 w-full bg-eternal-black text-eternal-white py-4 text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
  >
                    {orderLoading ? (
                      <><FiLoader size={14} className="animate-spin" /> Placing Order...</>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>}

              {
    /* Navigation */
  }
              {stepError && (
                <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{stepError}</p>
              )}
              <div className="mt-8 flex items-center justify-between">
                {currentStep > 1 ? <button
    onClick={goBack}
    className="text-sm text-eternal-stone underline underline-offset-2"
  >
                    Back
                  </button> : <div />}
                {currentStep < 4 && <button
    onClick={goNext}
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
                      {money(((item.price ?? 0) * (item.quantity ?? 1)))}
                    </p>
                  </div>) : (
                  <p className="text-sm text-eternal-stone">Your cart is empty.</p>
                )}
            </div>

            {/* Coupon Code Input */}
            <div className="mb-4">
              <p className={labelClass}>Discount Code</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 border-b border-eternal-stone bg-transparent py-2 text-sm outline-none focus:border-eternal-black transition-colors placeholder:text-eternal-stone/50"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="text-xs tracking-widest uppercase px-3 py-2 border border-eternal-black text-eternal-black hover:bg-eternal-black hover:text-eternal-white transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  {couponLoading ? <FiLoader size={11} className="animate-spin" /> : <FiTag size={11} />}
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              {appliedCoupon && !couponError && (
                <p className="text-xs text-green-600 mt-1">✓ Code "{appliedCoupon}" applied — {money(couponDiscount)} off</p>
              )}
            </div>

            <div className="border-t border-eternal-stone/20 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-eternal-stone">Subtotal</span>
                <span>{money(displayTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-eternal-stone">Shipping</span>
                <span>
                  {shippingCost === 0 ? "Free" : money(shippingCost)}
                </span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-eternal-stone">Tax ({taxRatePercent}%)</span>
                  <span>{money(tax)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-{money(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium border-t border-eternal-stone/20 pt-3 mt-3">
                <span>Total</span>
                <span>{money(Math.max(0, grandTotal))}</span>
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
