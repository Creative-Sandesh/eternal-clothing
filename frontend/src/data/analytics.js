const revenueData = [
  { month: "Jan", revenue: 48200, orders: 142, target: 45e3 },
  { month: "Feb", revenue: 52400, orders: 158, target: 48e3 },
  { month: "Mar", revenue: 61800, orders: 187, target: 55e3 },
  { month: "Apr", revenue: 58300, orders: 174, target: 6e4 },
  { month: "May", revenue: 67500, orders: 203, target: 65e3 },
  { month: "Jun", revenue: 72100, orders: 218, target: 7e4 },
  { month: "Jul", revenue: 69400, orders: 208, target: 72e3 },
  { month: "Aug", revenue: 78900, orders: 237, target: 75e3 },
  { month: "Sep", revenue: 84300, orders: 252, target: 8e4 },
  { month: "Oct", revenue: 91200, orders: 274, target: 88e3 },
  { month: "Nov", revenue: 98700, orders: 296, target: 95e3 },
  { month: "Dec", revenue: 112400, orders: 338, target: 105e3 }
];
const categoryRevenue = [
  { name: "Tops", value: 28, color: "#2d4a3e" },
  { name: "Bottoms", value: 24, color: "#4a5e4a" },
  { name: "Outerwear", value: 22, color: "#8c8277" },
  { name: "Knitwear", value: 14, color: "#c9b99a" },
  { name: "Footwear", value: 8, color: "#e0d9cc" },
  { name: "Accessories", value: 4, color: "#f0ebe2" }
];
const topProducts = [
  { name: "Merino Crewneck Knit", sales: 312, revenue: 68640, growth: 18 },
  { name: "Heavyweight Fleece Hoodie", sales: 287, revenue: 70315, growth: 12 },
  { name: "Slim Straight Selvedge Denim", sales: 198, revenue: 63360, growth: 24 },
  { name: "Leather Chelsea Boot", sales: 143, revenue: 80795, growth: -3 },
  { name: "Cashmere Ribbed Beanie", sales: 387, revenue: 48375, growth: 31 }
];
const statsCards = [
  { label: "Total Revenue", value: "\xA3895,200", change: "+18.4%", trend: "up" },
  { label: "Total Orders", value: "2,687", change: "+12.1%", trend: "up" },
  { label: "Avg Order Value", value: "\xA3333", change: "+5.7%", trend: "up" },
  { label: "Active Customers", value: "1,204", change: "+22.3%", trend: "up" }
];
const trafficData = [
  { day: "Mon", sessions: 1240, pageviews: 3820 },
  { day: "Tue", sessions: 1580, pageviews: 4920 },
  { day: "Wed", sessions: 1380, pageviews: 4200 },
  { day: "Thu", sessions: 1720, pageviews: 5380 },
  { day: "Fri", sessions: 2100, pageviews: 6540 },
  { day: "Sat", sessions: 2480, pageviews: 7720 },
  { day: "Sun", sessions: 1960, pageviews: 6120 }
];
export {
  categoryRevenue,
  revenueData,
  statsCards,
  topProducts,
  trafficData
};
