import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTwitter, FiInstagram, FiLink, FiClock, FiArrowLeft } from "react-icons/fi";
const post = {
  category: "Philosophy",
  title: "The Art of Slow Fashion: Why Less Has Always Been More",
  author: "Isabelle Marchand",
  date: "January 14, 2026",
  readTime: "6 min read",
  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=800&fit=crop&auto=format"
};
const relatedPosts = [
  {
    slug: "cashmere-guide",
    category: "Materials",
    title: "Understanding Cashmere: A Field Guide to the World's Finest Fibre",
    date: "January 8, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=400&fit=crop&auto=format"
  },
  {
    slug: "the-white-shirt-thesis",
    category: "Wardrobe",
    title: "The White Shirt Thesis: Notes on a Wardrobe Constant",
    date: "December 18, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=400&fit=crop&auto=format"
  },
  {
    slug: "palette-of-neutrals",
    category: "Colour",
    title: "A Palette of Neutrals: The Science Behind Tones That Endure",
    date: "December 5, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop&auto=format"
  }
];
function BlogDetailPage() {
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Hero */
  }
      <div className="relative h-[70vh] flex items-end overflow-hidden bg-[#0a0a0a]">
        <img
    src={post.image}
    alt={post.title}
    className="absolute inset-0 w-full h-full object-cover opacity-55"
  />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/20 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-14 w-full">
          <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="inline-block bg-[#c9b99a] text-[#0a0a0a] text-[10px] tracking-[0.2em] uppercase px-3 py-1 mb-4"
  >
            {post.category}
          </motion.span>
          <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-4xl md:text-6xl text-[#fafafa] leading-tight mb-4 max-w-3xl"
  >
            {post.title}
          </motion.h1>
          <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="flex items-center gap-4 text-[#fafafa]/60 text-sm"
  >
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" />{post.readTime}</span>
          </motion.div>
        </div>
      </div>

      {
    /* Article */
  }
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[#8c8277] text-xs tracking-widest uppercase mb-10 hover:text-[#0a0a0a] transition-colors">
          <FiArrowLeft className="w-4 h-4" />
          The Journal
        </Link>

        <div className="prose max-w-none">
          <p className="text-[#0a0a0a] text-lg leading-[1.9] mb-6 font-light">
            There is a particular kind of satisfaction that comes from wearing a piece of clothing for the tenth time in a year — from reaching instinctively for the same linen shirt, the same wool trouser, the same jacket that has shaped itself, imperceptibly, to the contours of your body and life. This is not a satisfaction the fashion industry has historically wanted you to feel.
          </p>

          <p className="text-[#0a0a0a]/80 text-base leading-[1.9] mb-6">
            The economics of fashion depend on dissatisfaction. On the persistent, low-grade sense that what you have is not quite enough — not quite current, not quite right. The industry accelerated this dissatisfaction methodically through the latter half of the twentieth century, compressing seasonal cycles, multiplying trend categories, and ultimately arriving at the model of fast fashion: the promise of newness at near-zero cost.
          </p>

          <h2 className="font-display text-3xl text-[#0a0a0a] mt-10 mb-5">The Hidden Arithmetic of the Wardrobe</h2>

          <p className="text-[#0a0a0a]/80 text-base leading-[1.9] mb-6">
            When we account for cost-per-wear rather than purchase price, the economics of a considered wardrobe reveal themselves clearly. A shirt purchased for £180 and worn 150 times costs £1.20 per wear. Its fast-fashion equivalent, purchased for £25 and worn 8 times before it pills, fades, or falls from favour, costs £3.12 per wear — more than twice as much, at a fraction of the quality.
          </p>

          <p className="text-[#0a0a0a]/80 text-base leading-[1.9] mb-6">
            But this arithmetic, compelling as it is, misses the deeper point. It frames the argument for slow fashion in the same transactional language as fast fashion. The more honest case is less about value and more about relationship: the relationship between a person and their clothing, and between both and the world.
          </p>

          <h2 className="font-display text-3xl text-[#0a0a0a] mt-10 mb-5">Craft as Resistance</h2>

          <p className="text-[#0a0a0a]/80 text-base leading-[1.9] mb-6">
            To commission or purchase a piece of clothing made with genuine care — from fibres traced to their source, worked by hands whose skill has been developed over years — is a quiet act of resistance against a system that externalises its true costs. The fast fashion price tag does not include the water used in dyeing, the wages withheld, or the landfill awaiting the garment's brief life.
          </p>

          <p className="text-[#0a0a0a]/80 text-base leading-[1.9] mb-6">
            Slow fashion makes the full cost visible. And in doing so, it restores something that mass production removes: the human chain of care that connects maker, material, and wearer.
          </p>

          <h2 className="font-display text-3xl text-[#0a0a0a] mt-10 mb-5">Towards a More Considered Closet</h2>

          <p className="text-[#0a0a0a]/80 text-base leading-[1.9] mb-6">
            None of this demands austerity. A wardrobe built on fewer, better pieces is not an impoverished wardrobe. It is a curated one. It is the wardrobe of someone who knows what they reach for in the morning without thinking — and why. The difference between a closet full of options and a wardrobe full of answers is the difference between anxiety and ease.
          </p>

          <p className="text-[#0a0a0a]/80 text-base leading-[1.9]">
            At Eternal, we build pieces with the assumption that they will outlive the season they arrive in. That they will become part of the vocabulary of someone's daily life. That is, we believe, what clothing should do.
          </p>
        </div>

        {
    /* Share */
  }
        <div className="mt-12 pt-8 border-t border-[#0a0a0a]/10">
          <p className="text-[#8c8277] text-xs tracking-widest uppercase mb-4">Share</p>
          <div className="flex gap-3">
            {[
    { icon: FiTwitter, label: "Twitter" },
    { icon: FiInstagram, label: "Instagram" },
    { icon: FiLink, label: "Copy Link" }
  ].map(({ icon: Icon, label }) => <button
    key={label}
    className="flex items-center gap-2 border border-[#0a0a0a]/20 text-[#0a0a0a] text-xs tracking-wider px-4 py-2 hover:bg-[#0a0a0a] hover:text-[#fafafa] hover:border-[#0a0a0a] transition-colors"
  >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>)}
          </div>
        </div>
      </div>

      {
    /* Related Posts */
  }
      <div className="bg-[#f0ebe2] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="font-display text-4xl text-[#0a0a0a] mb-10">Related Reading</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((p, i) => <motion.div
    key={p.slug}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i * 0.1 }}
    className="group"
  >
                <Link to={`/blog/${p.slug}`} className="block">
                  <div className="overflow-hidden aspect-[4/3] bg-[#0a0a0a] mb-4">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90" />
                  </div>
                  <span className="inline-block text-[#c9b99a] text-[10px] tracking-[0.2em] uppercase mb-2">{p.category}</span>
                  <h4 className="font-display text-xl text-[#0a0a0a] leading-snug mb-2 group-hover:text-[#2d4a3e] transition-colors">{p.title}</h4>
                  <div className="flex items-center gap-3 text-[#8c8277] text-xs">
                    <span>{p.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{p.readTime}</span>
                  </div>
                </Link>
              </motion.div>)}
          </div>
        </div>
      </div>
    </div>;
}
export {
  BlogDetailPage as default
};
