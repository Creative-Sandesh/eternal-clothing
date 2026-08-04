const orders = [
  {
    id: "ord1",
    orderNumber: "ET-2024-00421",
    customerId: "cust1",
    customerName: "Marcus Chen",
    customerEmail: "marcus.chen@email.com",
    status: "delivered",
    items: [
      { productId: "p1", name: "Oversized Cotton Poplin Shirt", price: 185, quantity: 1, size: "M", color: "Chalk White", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=267&fit=crop&auto=format" },
      { productId: "p4", name: "Merino Crewneck Knit", price: 220, quantity: 1, size: "M", color: "Stone", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=267&fit=crop&auto=format" }
    ],
    subtotal: 405,
    shipping: 0,
    tax: 32.4,
    total: 437.4,
    shippingAddress: { line1: "248 West 14th Street", city: "New York", state: "NY", zip: "10011", country: "United States" },
    trackingNumber: "UPS1234567890",
    carrier: "UPS",
    createdAt: "2024-11-12T09:30:00Z",
    updatedAt: "2024-11-15T14:20:00Z"
  },
  {
    id: "ord2",
    orderNumber: "ET-2024-00420",
    customerId: "cust2",
    customerName: "Sofia Andersson",
    customerEmail: "sofia.a@email.com",
    status: "shipped",
    items: [
      { productId: "p5", name: "Unstructured Linen Blazer", price: 485, quantity: 1, size: "S", color: "Raw Sand", image: "https://images.unsplash.com/photo-1594938374182-a56369f9e71a?w=200&h=267&fit=crop&auto=format" },
      { productId: "p9", name: "Wide-Leg Linen Trouser", price: 225, quantity: 1, size: "S", color: "Ecru", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200&h=267&fit=crop&auto=format" }
    ],
    subtotal: 710,
    shipping: 0,
    tax: 56.8,
    total: 766.8,
    shippingAddress: { line1: "12 Redchurch Street", city: "London", state: "", zip: "E2 7DJ", country: "United Kingdom" },
    trackingNumber: "DHL9876543210",
    carrier: "DHL",
    createdAt: "2024-11-13T14:22:00Z",
    updatedAt: "2024-11-14T09:15:00Z"
  },
  {
    id: "ord3",
    orderNumber: "ET-2024-00419",
    customerId: "cust3",
    customerName: "James Whitfield",
    customerEmail: "j.whitfield@email.com",
    status: "processing",
    items: [
      { productId: "p6", name: "Slim Straight Selvedge Denim", price: 320, quantity: 1, size: "32", color: "Raw Indigo", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=267&fit=crop&auto=format" },
      { productId: "p10", name: "Leather Chelsea Boot", price: 565, quantity: 1, size: "EU 42", color: "Jet Black", image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=200&h=267&fit=crop&auto=format" }
    ],
    subtotal: 885,
    shipping: 15,
    tax: 72,
    total: 972,
    shippingAddress: { line1: "4 Rue du Faubourg Saint-Honor\xE9", city: "Paris", state: "", zip: "75008", country: "France" },
    createdAt: "2024-11-14T18:45:00Z",
    updatedAt: "2024-11-14T18:45:00Z"
  },
  {
    id: "ord4",
    orderNumber: "ET-2024-00418",
    customerId: "cust4",
    customerName: "Amara Osei",
    customerEmail: "amara.osei@email.com",
    status: "confirmed",
    items: [
      { productId: "p3", name: "Heavyweight Fleece Hoodie", price: 245, quantity: 2, size: "L", color: "Vintage Black", image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200&h=267&fit=crop&auto=format" }
    ],
    subtotal: 490,
    shipping: 0,
    tax: 39.2,
    total: 529.2,
    shippingAddress: { line1: "88 Shoreditch High Street", city: "London", state: "", zip: "E1 6JJ", country: "United Kingdom" },
    createdAt: "2024-11-14T11:20:00Z",
    updatedAt: "2024-11-14T12:00:00Z"
  },
  {
    id: "ord5",
    orderNumber: "ET-2024-00417",
    customerId: "cust5",
    customerName: "Lena Mayer",
    customerEmail: "lena.mayer@email.com",
    status: "cancelled",
    items: [
      { productId: "p2", name: "Relaxed Wool Trouser", price: 295, quantity: 1, size: "30", color: "Camel", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=267&fit=crop&auto=format" }
    ],
    subtotal: 295,
    shipping: 15,
    tax: 24.8,
    total: 334.8,
    shippingAddress: { line1: "Unter den Linden 7", city: "Berlin", state: "", zip: "10117", country: "Germany" },
    createdAt: "2024-11-11T16:30:00Z",
    updatedAt: "2024-11-12T10:00:00Z",
    notes: "Customer requested cancellation"
  }
];
export {
  orders
};
