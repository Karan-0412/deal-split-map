import { motion } from "framer-motion";
import CircularText from "./CircularText";
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-[#f7f7fb] font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          About <span className="text-[#6d5efc]">DealSplit</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl text-[#a1a1b3] max-w-2xl"
        >
          We’re on a mission to make sharing and saving effortless. Our story is
          about innovation, teamwork, and empowering communities.
        </motion.p>
      </section>

      {/* Cards Section */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 py-16">
        {[
          {
            title: "Our Story",
            desc: "From humble beginnings, we’ve built a platform that connects people through shared goals and savings.",
          },
          {
            title: "Our Values",
            desc: "We believe in transparency, collaboration, and delivering real value to our users every day.",
          },
          {
            title: "Our Team",
            desc: "A passionate group of developers, designers, and thinkers driven by a shared vision.",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3, duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-[#121216] border border-[#22232b] rounded-2xl p-8 shadow-lg hover:shadow-[#6d5efc]/40 transition-all"
          >
            <h2 className="text-2xl font-semibold mb-4">{card.title}</h2>
            <p className="text-[#a1a1b3]">{card.desc}</p>
          </motion.div>
        ))}
      </section>
      <section>
        <CircularText
        text="Coorder*Coorder*"
        onHover="speedUp"
        spinDuration={20}
        className="custom-class"
      />
      </section>

      {/* Floating Background Animation */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: "linear",
        }}
        className="absolute top-1/3 left-0 w-64 h-64 bg-[#6d5efc]/20 blur-3xl rounded-full"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
        className="absolute bottom-1/3 right-0 w-64 h-64 bg-[#4b3bd3]/20 blur-3xl rounded-full"
      />
    </div>
  );
}
