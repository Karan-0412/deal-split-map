import React from "react";
import Navigation from "@/components/Navigation";
import { Linkedin, Instagram, Github, Mail } from "lucide-react";
import { motion } from "framer-motion";

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
    bio: "Building connections and making sharing simple. Also a professional coffee taste-tester.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "2",
    name: "Liam Chen",
    role: "Lead Engineer",
    bio: "Crafting performant maps and delightful UX. Rumored to debug with sheer stare alone.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "3",
    name: "Maya Patel",
    role: "Product Designer",
    bio: "Designing intuitive experiences and visuals. Draws icons in their sleep.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "4",
    name: "Noah Rivera",
    role: "Community Lead",
    bio: "Connecting users and growing our community. Official meme curator.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
  {
    id: "5",
    name: "Zara Kim",
    role: "Growth Engineer",
    bio: "Finds the best partnerships and the best snack combos.",
    avatar: "/placeholder.svg",
    links: { linkedin: "#", instagram: "#", github: "#" },
  },
];

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold">Contact & Team</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Have a question, a compliment, or a suspiciously great snack recommendation? We read everything (yes, even the haikus). Say hi below — humans and bots both welcome.</p>
        </motion.header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {TEAM.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl p-4 flex flex-col items-center text-center shadow-card hover:shadow-primary/20 transform transition-all hover:-translate-y-1"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-3 ring-2 ring-white/10">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              </div>
              <div className="font-semibold text-lg">{member.name}</div>
              <div className="text-sm text-muted-foreground">{member.role}</div>
              <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>

              <div className="flex items-center gap-3 mt-3">
                {member.links?.linkedin && (
                  <a href={member.links.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-muted/10 hover:bg-muted transition text-muted-foreground">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {member.links?.instagram && (
                  <a href={member.links.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-muted/10 hover:bg-muted transition text-muted-foreground">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {member.links?.github && (
                  <a href={member.links.github} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-muted/10 hover:bg-muted transition text-muted-foreground">
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </section>

        <section className="max-w-3xl mx-auto bg-card/90 border border-border/30 rounded-xl p-6 shadow-card">
          <motion.h2 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold mb-2">Say hello</motion.h2>
          <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-muted-foreground mb-4">Send us a message and we will get back to you within 1–2 business days.</motion.p>

          <form onSubmit={(e) => e.preventDefault()} className="grid gap-3 md:grid-cols-2">
            <input name="name" placeholder="Your name" className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none" />
            <input name="email" placeholder="Your email" className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none" />
            <input name="subject" placeholder="Subject" className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none md:col-span-2" />
            <textarea name="message" placeholder="Write your message..." className="p-3 rounded-lg bg-background/80 border border-border text-foreground focus:outline-none md:col-span-2 min-h-[140px]" />

            <div className="md:col-span-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <div>support@dealsplit.example</div>
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-semibold">Send message</button>
            </div>
          </form>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5">
              <h3 className="font-semibold">Office</h3>
              <p className="text-sm text-muted-foreground mt-1">123 Market St, San Francisco, CA</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/5">
              <h3 className="font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground mt-1">Mon–Fri, 9am–6pm</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Contact;
