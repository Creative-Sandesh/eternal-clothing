import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiArrowRight } from "react-icons/fi";
const posts = [
  {
    slug: "the-art-of-slow-fashion",
    category: "Philosophy",
    title: "The Art of Slow Fashion: Why Less Has Always Been More",
    excerpt: "In an era of disposable trends, we explore why deliberate curation \u2014 choosing fewer, better pieces \u2014 is both a personal and collective act of care.",
    date: "January 14, 2026",
    readTime: "6 min read",
    author: "Isabelle Marchand",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=700&fit=crop&auto=format",
    featured: true
  },
  {
    slug: "cashmere-guide",
    category: "Materials",
    title: "Understanding Cashmere: A Field Guide to the World's Finest Fibre",
    excerpt: "From the highlands of Inner Mongolia to our finishing rooms, we trace the extraordinary journey of cashmere \u2014 and what separates exceptional from adequate.",
    date: "January 8, 2026",
    readTime: "8 min read",
    author: "Thomas Eriksen",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop&auto=format",
    featured: false
  },
  {
    slug: "dressing-for-architecture",
    category: "Style",
    title: "Dressing for Architecture: How Space Shapes What We Wear",
    excerpt: "The rooms we inhabit inform our clothing choices in ways we rarely acknowledge. A conversation with interior architect Nadia Osei on the relationship between built space and personal style.",
    date: "December 30, 2025",
    readTime: "5 min read",
    author: "Isabelle Marchand",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format",
    featured: false
  },
  {
    slug: "the-white-shirt-thesis",
    category: "Wardrobe",
    title: "The White Shirt Thesis: Notes on a Wardrobe Constant",
    excerpt: "No garment has been more consistently misunderstood. We examine the white shirt not as a basic, but as the most sophisticated statement in your wardrobe.",
    date: "December 18, 2025",
    readTime: "4 min read",
    author: "Clara Novak",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=600&fit=crop&auto=format",
    featured: false
  },
  {
    slug: "palette-of-neutrals",
    category: "Colour",
    title: "A Palette of Neutrals: The Science Behind Tones That Endure",
    excerpt: "Why do stone, ecru, and forest green feel timeless while other colours fade? We examine the chromatic logic of the colours we return to, season after season.",
    date: "December 5, 2025",
    readTime: "7 min read",
    author: "Thomas Eriksen",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop&auto=format",
    featured: false
  },
  {
    slug: "japanese-selvedge-denim",
    category: "Craft",
    title: "The Slow Weave: Inside a Japanese Selvedge Denim Mill",
    excerpt: "In the Kojima district of Okayama, looms that predate the internet produce fabric at a fraction of the speed of modern mills. We visited to understand why this matters.",
    date: "November 22, 2025",
    readTime: "10 min read",
    author: "Clara Novak",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop&auto=format",
    featured: false
  },
  {
    slug: "capsule-wardrobe-winter",
    category: "Wardrobe",
    title: "Building a Winter Capsule: Twelve Pieces, Infinite Combinations",
    excerpt: "The mathematics of a considered wardrobe: how twelve carefully chosen pieces can produce more variety \u2014 and more satisfaction \u2014 than sixty fast-fashion alternatives.",
    date: "November 10, 2025",
    readTime: "9 min read",
    author: "Isabelle Marchand",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=600&fit=crop&auto=format",
    featured: false
  }
];
const featured = posts.find((p) => p.featured);
const grid = posts.filter((p) => !p.featured);
function BlogListPage() {
  return <div className="bg-[#fafafa] min-h-screen">
      {
    /* Header */
  }
      <div className="bg-[#0a0a0a] pt-28 pb-16 px-6 text-center">
        <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-[#c9b99a] text-xs tracking-[0.3em] uppercase mb-4"
  >
          Eternal
        </motion.p>
        <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="font-display text-7xl md:text-9xl text-[#fafafa] leading-none"
  >
          The Journal
        </motion.h1>
        <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="text-[#8c8277] mt-5 text-base"
  >
          Ideas on craft, culture, and conscious dressing.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {
    /* Featured Post */
  }
        <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="group mb-16"
  >
          <Link to={`/blog/${featured.slug}`} className="block">
            <div className="relative overflow-hidden aspect-[16/7] bg-[#f0ebe2] mb-6">
              <img
    src={featured.image}
    alt={featured.title}
    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
  />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="inline-block bg-[#c9b99a] text-[#0a0a0a] text-[10px] tracking-[0.2em] uppercase px-3 py-1 mb-3">
                  {featured.category}
                </span>
                <h2 className="font-display text-4xl md:text-5xl text-[#fafafa] max-w-2xl leading-tight mb-3">
                  {featured.title}
                </h2>
                <p className="text-[#fafafa]/70 text-sm max-w-xl leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-4 mt-4 text-[#fafafa]/60 text-xs">
                  <span>{featured.author}</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{featured.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {
    /* Grid */
  }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {grid.map((post, i) => <motion.div
    key={post.slug}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: i % 3 * 0.1 }}
    className="group"
  >
              <Link to={`/blog/${post.slug}`} className="block">
                <div className="overflow-hidden aspect-[4/3] bg-[#f0ebe2] mb-4">
                  <img
    src={post.image}
    alt={post.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
                </div>
                <span className="inline-block text-[#c9b99a] text-[10px] tracking-[0.2em] uppercase mb-2">
                  {post.category}
                </span>
                <h3 className="font-display text-xl text-[#0a0a0a] leading-snug mb-2 group-hover:text-[#2d4a3e] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[#8c8277] text-sm leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-[#8c8277] text-xs">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{post.readTime}</span>
                </div>
              </Link>
            </motion.div>)}
        </div>

        {
    /* Load More */
  }
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-2 text-[#0a0a0a] text-xs tracking-[0.2em] uppercase border border-[#0a0a0a] px-8 py-3 hover:bg-[#0a0a0a] hover:text-[#fafafa] transition-colors">
            Load More Articles
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>;
}
export {
  BlogListPage as default
};
