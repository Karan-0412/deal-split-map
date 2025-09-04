import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Linkedin, Instagram, Github, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  links?: { linkedin?: string; instagram?: string; github?: string };
};

const TEAM: TeamMember[] = [
  {
    id: "1",
    name: "Ava Stone",
    role: "Founder & CEO",
    bio: "Building connections and making sharing simple. Official taste tester of all post-meeting snacks.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "2",
    name: "Liam Chen",
    role: "Lead Engineer",
    bio: "Optimizes everything — including the team's coffee-to-code ratio. Debugs with a stare that sends bugs packing.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "3",
    name: "Maya Patel",
    role: "Product Designer",
    bio: "Makes things pretty and usable. Has opinions about padding and the correct emoji for success states.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "4",
    name: "Noah Rivera",
    role: "Community Lead",
    bio: "Greets every new user like they're an old friend and curates the team's birthday playlists.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "5",
    name: "Zara Kim",
    role: "Growth Engineer",
    bio: "Finds growth opportunities and the best snack combos for crunch-time sprints.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
  hover: { scale: 1.02, y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
};

const iconHover = { scale: 1.15, rotate: 8 };

const Contact: React.FC = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setSent(false);

    // Simulate async send
    setTimeout(() => {
      setSending(false);
      setSent(true);
      // hide success after a short while so user can send again
      setTimeout(() => setSent(false), 3500);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold">Contact & Team</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Have a question, a compliment, or a suspiciously great snack recommendation? We read everything (yes, even the haikus).
            Say hi below — humans, bots, hamsters, and carrier pigeons all welcome.
          </p>
        </motion.header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {TEAM.map((member, idx) => (
            <motion.article
              key={member.id}
              custom={idx}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
              className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl p-4 flex flex-col items-center text-center shadow-card transform transition-all"
            >
              <motion.div
                initial={{ scale: 0.98 }}
                whileHover={{ scale: 1.06, rotate: 3 }}
                className="w-24 h-24 rounded-full overflow-hidden mb-3 ring-2 ring-white/10"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
              </motion.div>

              <div className="font-semibold text-lg">{member.name}</div>
              <div className="text-sm text-muted-foreground">{member.role}</div>

              <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>

              <div className="flex items-center gap-3 mt-3">
                <motion.a
                  href={member.links?.linkedin || '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} LinkedIn`}
                  whileHover={iconHover}
                  className="p-2 rounded-full bg-muted/10 hover:bg-muted transition text-muted-foreground"
                >
                  <Linkedin className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href={member.links?.instagram || '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} Instagram`}
                  whileHover={iconHover}
                  className="p-2 rounded-full bg-muted/10 hover:bg-muted transition text-muted-foreground"
                >
                  <Instagram className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href={member.links?.github || '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} GitHub`}
                  whileHover={iconHover}
                  className="p-2 rounded-full bg-muted/10 hover:bg-muted transition text-muted-foreground"
                >
                  <Github className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="max-w-3xl mx-auto bg-card/90 border border-border/30 rounded-xl p-6 shadow-card relative">
          <motion.h2 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold mb-2">
            Say hello
          </motion.h2>
          <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-muted-foreground mb-4">
            Send us a message and we'll reply within 1–2 business days. If you include snacks, response time may improve dramatically.
          </motion.p>

          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <motion.input
              name="name"
              placeholder="Your name (nicknames accepted)"
              className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            />

            <motion.input
              name="email"
              placeholder="Your email (so we can send praise back)"
              className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            />

            <motion.input
              name="subject"
              placeholder={"Subject (e.g. \" + '\"You fixed my life\"' + \")"}
              className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none md:col-span-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            />

            <motion.textarea
              name="message"
              placeholder={"Write your message... (haikus welcome)"}
              className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none md:col-span-2 min-h-[140px]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            />

            <div className="md:col-span-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <div>support@dealsplit.example</div>
              </div>

              <motion.button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-white font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                aria-live="polite"
              >
                {sending ? (
                  <span className="animate-pulse">Sending…</span>
                ) : (
                  <>
                    <span>Send message</span>
                    <motion.span
                      initial={{ x: -6, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      ✉️
                    </motion.span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <AnimatePresence>
            {sent && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-0 mt-[-1.5rem] bg-foreground text-background px-4 py-2 rounded-full shadow-lg"
              >
                Message sent! Our resident carrier pigeon is on it 🕊️ (and yes, it knows directions)
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.01 }} className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5">
              <h3 className="font-semibold">Office</h3>
              <p className="text-sm text-muted-foreground mt-1">123 Market St, San Francisco, CA</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/5">
              <h3 className="font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground mt-1">Mon–Fri, 9am–6pm</p>
            </motion.div>
          </div>

          <motion.div
            className="absolute -right-8 -top-8 text-3xl pointer-events-none select-none opacity-60"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            aria-hidden
          >
            💬
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
