import React from "react";
import { motion } from "framer-motion";
import FuzzyText from "./FuzzyText";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-[#f7f7fb] font-sans px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Animated Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
<h1
  style={{
    fontSize: "70px",
    fontWeight: "900",
    textAlign: "center",
    marginBottom: "24px",
    color: "#f7f7fb",
    letterSpacing: "1px",
  }}
>
  Privacy Policy
</h1>

          <p className="text-gray-400 mt-4 text-lg">
            Learn how we protect and use your data
          </p>
        </motion.div>

        {/* Card Section */}
        <motion.section
          className="bg-[#121216] border border-[#22232b] rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Introduction */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-[#f7f7fb] mb-2 drop-shadow-lg">
              Introduction
            </h2>
            <p className="text-gray-400">
              This is a placeholder Privacy Policy for DealSplit.
            </p>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-[#f7f7fb] mb-2 drop-shadow-lg">
              Information We Collect
            </h2>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Account details you provide (e.g., name and email)</li>
              <li>Usage data that helps us improve the product</li>
              <li>Device and log information</li>
            </ul>
          </motion.div>

          {/* How We Use Information */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-[#f7f7fb] mb-2 drop-shadow-lg">
              How We Use Information
            </h2>
            <p className="text-gray-400">
              We use data to operate, maintain, and improve our services.
            </p>
          </motion.div>

          {/* Your Choices */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-[#f7f7fb] mb-2 drop-shadow-lg">
              Your Choices
            </h2>
            <p className="text-gray-400">
              You can request access, correction, or deletion of your data.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-[#f7f7fb] mb-2 drop-shadow-lg">
              Contact
            </h2>
            <p className="text-gray-400">
              For privacy-related questions, contact us at{" "}
              <a
                href="mailto:privacy@example.com"
                className="text-[#6d5efc] hover:underline"
              >
                privacy@example.com
              </a>
              .
            </p>
          </motion.div>
        </motion.section>

        {/* Back to Home */}
        <motion.p
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <a
            href="/"
            className="text-[#6d5efc] hover:text-[#8d7efc] transition-colors"
          >
            ← Back to Home
          </a>
        </motion.p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
