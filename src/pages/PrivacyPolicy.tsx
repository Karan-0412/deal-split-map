import React, { useRef } from "react";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, User, Globe, Database } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const downloadPdf = async () => {
    const content = contentRef.current;
    if (!content) return;

    // Dynamically load html2canvas and jsPDF from CDN if not present
    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });

    try {
      // html2canvas and jspdf UMD urls
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      // @ts-ignore
      const html2canvas = (window as any).html2canvas;
      // @ts-ignore
      const { jsPDF } = (window as any).jspdf || (window as any).window && (window as any).window.jspdf ? (window as any).window : (window as any);

      if (!html2canvas || !jsPDF) {
        throw new Error('Required libraries are not available');
      }

      const originalBg = content.style.backgroundColor;
      // Ensure white background for PDF
      (content as HTMLElement).style.background = '#ffffff';

      const canvas = await html2canvas(content as HTMLElement, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');

      // Restore background
      (content as HTMLElement).style.background = originalBg || '';

      // Create jsPDF and add the image
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions to fit A4 while preserving aspect ratio
      const img = new Image();
      img.src = imgData;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const drawWidth = imgWidth * ratio;
      const drawHeight = imgHeight * ratio;
      const x = (pageWidth - drawWidth) / 2;
      const y = 40; // top margin

      pdf.addImage(imgData, 'PNG', x, y, drawWidth, drawHeight);

      // Trigger download without redirect
      pdf.save('dealsplit-privacy-policy.pdf');
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('Failed to generate PDF automatically. Please use the browser print dialog as a fallback.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy — The human, the legal, and the slightly philosophical</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">We respect your data. We also believe privacy doesn't have to be boring — here's everything you need to know, written plainly (with a dash of personality).</p>
        </motion.header>

        <motion.section className="grid gap-6 md:grid-cols-3 mb-8">
          <motion.article className="p-4 bg-card/80 border border-border/30 rounded-xl shadow-card flex flex-col gap-3" whileHover={{ y: -6 }}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h3 className="font-semibold">Security-first</h3>
            </div>
            <p className="text-sm text-muted-foreground">We use industry-standard measures to protect your information and minimize risks.</p>
          </motion.article>

          <motion.article className="p-4 bg-card/80 border border-border/30 rounded-xl shadow-card flex flex-col gap-3" whileHover={{ y: -6 }}>
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-accent" />
              <h3 className="font-semibold">Your control</h3>
            </div>
            <p className="text-sm text-muted-foreground">You can access, update, and delete your data. We provide tools and you can contact us anytime.</p>
          </motion.article>

          <motion.article className="p-4 bg-card/80 border border-border/30 rounded-xl shadow-card flex flex-col gap-3" whileHover={{ y: -6 }}>
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-foreground" />
              <h3 className="font-semibold">Worldwide by design</h3>
            </div>
            <p className="text-sm text-muted-foreground">We comply with global privacy principles. If you are subject to a local law, we'll help you exercise your rights.</p>
          </motion.article>
        </motion.section>

        <section ref={contentRef} className="max-w-4xl mx-auto">
          <div className="bg-card/90 border border-border/30 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-3">What we collect</h2>
            <ul className="list-disc ml-5 text-muted-foreground space-y-2">
              <li><strong>Account info:</strong> name, email, profile picture (if you add one) — so we can say hi properly.</li>
              <li><strong>Requests & interactions:</strong> posts, joins, messages, and other actions when you use the service.</li>
              <li><strong>Usage data:</strong> logs, performance metrics, and anonymized analytics to make the product faster and friendlier.</li>
            </ul>
          </div>

          <div className="bg-card/90 border border-border/30 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-3">How we use it</h2>
            <p className="text-muted-foreground mb-3">Short version: to run the service, keep things useful, and make decisions that benefit our community.</p>
            <ol className="list-decimal ml-5 text-muted-foreground space-y-2">
              <li>Enable basic functionality (logins, profiles, posting requests).</li>
              <li>Improve recommendations, search, and maps.</li>
              <li>Protect against fraud and misuse.</li>
            </ol>
          </div>

          <div className="bg-card/90 border border-border/30 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-3">Sharing & third parties</h2>
            <p className="text-muted-foreground">We do not sell your personal data. We may share limited data with:</p>
            <ul className="list-disc ml-5 text-muted-foreground mt-2">
              <li>Service providers (hosting, analytics) under contract.</li>
              <li>Law enforcement when required by law.</li>
            </ul>
          </div>

          <div className="bg-card/90 border border-border/30 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-3">Cookies & tracking</h2>
            <p className="text-muted-foreground">We use cookies and similar technologies for essential functionality and analytics. You can manage cookies via your browser.</p>
          </div>

          <div className="bg-card/90 border border-border/30 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-3">Data retention & deletion</h2>
            <p className="text-muted-foreground">We keep data only as long as needed. You may request deletion and we will comply subject to legal obligations.</p>
          </div>

          <div className="bg-card/90 border border-border/30 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-3">Security</h2>
            <p className="text-muted-foreground">We use standard controls (encryption, access controls, monitoring) to protect data. No system is perfect — if something happens we'll be transparent and fix it fast.</p>
          </div>

          <div className="bg-card/90 border border-border/30 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-3">Children</h2>
            <p className="text-muted-foreground">Our service is not intended for children under 13. If you believe a child provided personal data, contact us and we'll help.</p>
          </div>

          <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
            <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
            <div className="flex items-center gap-3">
              <a href="mailto:privacy@example.com" className="text-primary font-semibold">privacy@example.com</a>
              <button onClick={downloadPdf} className="text-sm px-3 py-1 rounded bg-muted/80 hover:bg-muted transition">Download PDF</button>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-muted-foreground">
          <p>We wrote this with care. You can enjoy the rest of your day now.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
