import React from "react";

const styles = {
  page: {
    margin: 0,
    background: "#0b0b0c",
    color: "#f7f7fb",
    font: "16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif",
  },
  wrap: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "48px 20px",
  },
  h1: {
    fontSize: "40px",
    margin: "0 0 12px",
  },
  h2: {
    fontSize: "22px",
    margin: "28px 0 10px",
  },
  p: {
    color: "#a1a1b3",
  },
  li: {
    color: "#a1a1b3",
  },
  card: {
    background: "#121216",
    border: "1px solid #22232b",
    borderRadius: "14px",
    padding: "24px",
  },
  ul: {
    paddingLeft: "18px",
  },
  link: {
    color: "#6d5efc",
    textDecoration: "none",
  },
};

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Privacy Policy</h1>

        <section style={styles.card}>
          <h2 style={styles.h2}>Introduction</h2>
          <p style={styles.p}>This is a placeholder Privacy Policy for DealSplit.</p>

          <h2 style={styles.h2}>Information we collect</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>Account details you provide (e.g., name and email)</li>
            <li style={styles.li}>Usage data that helps us improve the product</li>
            <li style={styles.li}>Device and log information</li>
          </ul>

          <h2 style={styles.h2}>How we use information</h2>
          <p style={styles.p}>
            We use data to operate, maintain, and improve our services.
          </p>

          <h2 style={styles.h2}>Your choices</h2>
          <p style={styles.p}>
            You can request access, correction, or deletion of your data.
          </p>

          <h2 style={styles.h2}>Contact</h2>
          <p style={styles.p}>
            For privacy-related questions, contact us at{" "}
            <a href="mailto:privacy@example.com" style={styles.link}>
              privacy@example.com
            </a>
            .
          </p>
        </section>

        <p style={{ marginTop: "24px" }}>
          <a href="/" style={styles.link}>
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
