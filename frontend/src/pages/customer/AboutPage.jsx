import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const values = [
  {
    title: "Uncompromising Quality",
    desc: "Every piece is crafted from materials sourced for their longevity and provenance. We work only with mills and artisans who share our commitment to excellence.",
    icon: "\u25C6"
  },
  {
    title: "Responsible Craft",
    desc: "From organic fibres to low-impact dyeing processes, sustainability is woven into each decision we make \u2014 not as a footnote, but as a foundation.",
    icon: "\u25C7"
  },
  {
    title: "Timeless Design",
    desc: "We reject the cycle of trend and disposal. Eternal pieces are designed to be worn for decades, not discarded with the season.",
    icon: "\u25CB"
  }
];
const team = [
  {
    name: "Isabelle Fontaine",
    role: "Founder & Creative Director",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format"
  },
  {
    name: "Marcus Osei",
    role: "Head of Design",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&auto=format"
  },
  {
    name: "Lena Brandt",
    role: "Head of Sustainability",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&auto=format"
  },
  {
    name: "James Whitfield",
    role: "Director of Operations",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format"
  }
];
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};
function AboutPage() {
  return <div style={{ backgroundColor: "#fafafa" }}>
      {
    /* Hero */
  }
      <div className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <img
    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80"
    alt="Eternal story"
    className="absolute inset-0 w-full h-full object-cover"
  />
        <div
    className="absolute inset-0"
    style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.65) 100%)" }}
  />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6 text-center">
          <motion.p
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.6 }}
    className="text-xs uppercase tracking-[0.4em] mb-4"
    style={{ color: "#c9b99a", fontFamily: "Manrope, sans-serif" }}
  >
            Since 2010
          </motion.p>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35, duration: 0.7 }}
    className="font-display text-6xl md:text-7xl"
    style={{ color: "#fafafa" }}
  >
            Our Story
          </motion.h1>
        </div>
      </div>

      {
    /* Brand story */
  }
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              The Beginning
            </p>
            <h2 className="font-display text-4xl mb-8 leading-tight" style={{ color: "#0a0a0a" }}>
              Born from a desire<br />to wear less, better
            </h2>
            <div className="space-y-5 text-sm leading-relaxed" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              <p>
                Eternal began in a small atelier in East London in 2010. Founder Isabelle Fontaine, frustrated by fashion's
                relentless churn, set out to create something different: garments built to outlast trends, made by hands that
                know their craft.
              </p>
              <p>
                The first collection was twelve pieces — each one obsessively refined, each one made to be worn forever.
                The response was immediate. Customers understood intuitively what Eternal stood for: quality over quantity,
                presence over noise.
              </p>
              <p>
                Today, Eternal operates from studios in London and Lisbon, working with a curated network of artisan
                producers across Europe. Every season, we release a small, considered collection. Nothing more.
              </p>
            </div>
          </motion.div>

          <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="relative"
  >
            <img
    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=900&fit=crop&auto=format"
    alt="Eternal atelier"
    className="w-full object-cover"
    style={{ aspectRatio: "4/5" }}
  />
            <div
    className="absolute -bottom-6 -left-6 w-32 h-32 hidden lg:block"
    style={{ backgroundColor: "#f0ebe2" }}
  />
          </motion.div>
        </div>
      </section>

      {
    /* Values */
  }
      <section style={{ backgroundColor: "#f0ebe2" }} className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="text-center mb-16"
  >
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
              Our Pillars
            </p>
            <h2 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>What We Stand For</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, idx) => <motion.div
    key={v.title}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{ delay: idx * 0.1 }}
    className="p-8"
    style={{ backgroundColor: "#fafafa" }}
  >
                <p className="font-display text-3xl mb-6" style={{ color: "#c9b99a" }}>{v.icon}</p>
                <h3 className="font-display text-xl mb-4" style={{ color: "#0a0a0a" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>{v.desc}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {
    /* Team */
  }
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="mb-16"
  >
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            The People
          </p>
          <h2 className="font-display text-4xl" style={{ color: "#0a0a0a" }}>Behind Eternal</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member, idx) => <motion.div
    key={member.name}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{ delay: idx * 0.1 }}
    className="group"
  >
              <div className="overflow-hidden mb-4" style={{ aspectRatio: "4/5" }}>
                <img
    src={member.image}
    alt={member.name}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
              </div>
              <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: "Manrope, sans-serif" }}>{member.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>{member.role}</p>
            </motion.div>)}
        </div>
      </section>

      {
    /* Materials */
  }
      <section
    className="py-24 px-6"
    style={{ backgroundColor: "#2d4a3e" }}
  >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
            <p className="text-xs uppercase tracking-[0.4em] mb-4" style={{ color: "#c9b99a", fontFamily: "Manrope, sans-serif" }}>
              Materials
            </p>
            <h2 className="font-display text-4xl mb-6" style={{ color: "#fafafa" }}>
              The Fabric of Our Commitment
            </h2>
            <p className="text-sm leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: "rgba(250,250,250,0.7)", fontFamily: "Manrope, sans-serif" }}>
              We work exclusively with GOTS-certified organic cotton, responsible wool, and traceable European linen.
              Every material is chosen not just for how it feels, but for where it comes from and where it will go.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["GOTS Certified", "Traceable Wool", "European Linen", "Recycled Packaging"].map((tag) => <span
    key={tag}
    className="text-xs uppercase tracking-widest px-4 py-2 border"
    style={{ borderColor: "rgba(201,185,154,0.4)", color: "#c9b99a", fontFamily: "Manrope, sans-serif" }}
  >
                  {tag}
                </span>)}
            </div>
          </motion.div>
        </div>
      </section>

      {
    /* CTA */
  }
      <section className="py-24 px-6 text-center" style={{ backgroundColor: "#fafafa" }}>
        <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
          <h2 className="font-display text-4xl mb-4" style={{ color: "#0a0a0a" }}>
            Wear the Philosophy
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#8c8277", fontFamily: "Manrope, sans-serif" }}>
            Discover pieces made to last a lifetime.
          </p>
          <Link
    to="/shop"
    className="inline-block px-12 py-4 text-xs uppercase tracking-widest"
    style={{ backgroundColor: "#0a0a0a", color: "#fafafa", fontFamily: "Manrope, sans-serif" }}
  >
            Shop the Collection
          </Link>
        </motion.div>
      </section>
    </div>;
}
export {
  AboutPage as default
};
