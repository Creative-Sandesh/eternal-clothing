import { useState } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiPhone, FiClock, FiExternalLink } from "react-icons/fi";
const stores = [
  {
    id: 1,
    name: "Eternal London",
    country: "United Kingdom",
    address: "14 Albemarle Street, Mayfair, London W1S 4HW",
    hours: "Mon\u2013Sat 10:00\u201319:00, Sun 12:00\u201318:00",
    phone: "+44 20 7946 0000",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&auto=format"
  },
  {
    id: 2,
    name: "Eternal New York",
    country: "United States",
    address: "836 Madison Avenue, Upper East Side, New York, NY 10065",
    hours: "Mon\u2013Sat 10:00\u201319:00, Sun 11:00\u201318:00",
    phone: "+1 212 555 0174",
    image: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&h=400&fit=crop&auto=format"
  },
  {
    id: 3,
    name: "Eternal Paris",
    country: "France",
    address: "24 Rue du Faubourg Saint-Honor\xE9, 75008 Paris",
    hours: "Mar\u2013Sam 10:00\u201319:30, Dim 13:00\u201318:00",
    phone: "+33 1 42 68 00 10",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop&auto=format"
  },
  {
    id: 4,
    name: "Eternal Milan",
    country: "Italy",
    address: "Via della Spiga 12, 20121 Milano MI",
    hours: "Lun\u2013Sab 10:00\u201319:30, Dom 13:00\u201318:00",
    phone: "+39 02 7602 1340",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop&auto=format"
  }
];
const countries = ["All", "United Kingdom", "United States", "France", "Italy"];
function StoreLocatorPage() {
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedStore, setSelectedStore] = useState(stores[0]);
  const filtered = selectedCountry === "All" ? stores : stores.filter((s) => s.country === selectedCountry);
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Header */
  }
      <div className="bg-[#0a0a0a] pt-28 pb-14 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-4"
  >
            Visit Us
          </motion.p>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-6xl md:text-7xl text-[#fafafa] leading-none"
  >
            Store Locator
          </motion.h1>
        </div>
      </div>

      {
    /* Filter */
  }
      <div className="border-b border-[#0a0a0a]/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6 overflow-x-auto">
          <span className="text-[#8c8277] text-xs tracking-widest uppercase whitespace-nowrap">Filter by:</span>
          {countries.map((c) => <button
    key={c}
    onClick={() => setSelectedCountry(c)}
    className={`text-sm whitespace-nowrap transition-colors ${selectedCountry === c ? "text-[#2d4a3e] font-medium" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}
  >
              {c}
            </button>)}
        </div>
      </div>

      {
    /* Main Content */
  }
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {
    /* Store List */
  }
          <div className="space-y-4">
            {filtered.map((store, i) => <motion.div
    key={store.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: i * 0.08 }}
    onClick={() => setSelectedStore(store)}
    className={`p-6 cursor-pointer border transition-all ${selectedStore.id === store.id ? "border-[#2d4a3e] bg-white shadow-sm" : "border-[#0a0a0a]/10 bg-white hover:border-[#2d4a3e]/40"}`}
  >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-xl text-[#0a0a0a] mb-0.5">{store.name}</h3>
                    <p className="text-[#c9b99a] text-[10px] tracking-widest uppercase">{store.country}</p>
                  </div>
                  {selectedStore.id === store.id && <div className="w-2 h-2 rounded-full bg-[#2d4a3e] mt-1.5 flex-shrink-0" />}
                </div>

                <div className="space-y-2 text-sm text-[#8c8277]">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#2d4a3e]" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiClock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#2d4a3e]" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-3.5 h-3.5 flex-shrink-0 text-[#2d4a3e]" />
                    <span>{store.phone}</span>
                  </div>
                </div>

                <button className="mt-4 inline-flex items-center gap-1.5 text-[#2d4a3e] text-xs tracking-[0.12em] uppercase border-b border-[#2d4a3e]/40 pb-0.5 hover:border-[#2d4a3e] transition-colors">
                  <FiExternalLink className="w-3.5 h-3.5" />
                  Get Directions
                </button>
              </motion.div>)}
          </div>

          {
    /* Map Placeholder */
  }
          <div className="lg:sticky lg:top-24">
            <div className="bg-[#2d4a3e] aspect-[4/3] relative overflow-hidden flex flex-col items-center justify-center">
              {
    /* Decorative grid lines */
  }
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="absolute w-full border-t border-white" style={{ top: `${i * 12.5}%` }} />)}
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="absolute h-full border-l border-white" style={{ left: `${i * 12.5}%` }} />)}
              </div>

              {
    /* Store pin */
  }
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 rounded-full bg-[#c9b99a] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiMapPin className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                <p className="text-[#fafafa] font-display text-2xl mb-1">{selectedStore.name}</p>
                <p className="text-[#c9b99a] text-sm">{selectedStore.address}</p>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[#fafafa]/30 text-xs tracking-widest uppercase">Interactive Map</span>
                <span className="text-[#fafafa]/30 text-xs">© Eternal 2026</span>
              </div>
            </div>

            {
    /* Selected store image */
  }
            <div className="mt-4 overflow-hidden aspect-[16/9] bg-[#f0ebe2]">
              <img
    src={selectedStore.image}
    alt={selectedStore.name}
    className="w-full h-full object-cover transition-all duration-500"
  />
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export {
  StoreLocatorPage as default
};
