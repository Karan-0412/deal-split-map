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
    fontSize: "20px",
    margin: "20px 0 8px",
  },
  p: {
    color: "#a1a1b3",
  },
  details: {
    background: "#121216",
    border: "1px solid #22232b",
    borderRadius: "12px",
    padding: "16px",
    margin: "12px 0",
  },
  summary: {
    cursor: "pointer",
    fontWeight: 600,
  },
  link: {
    color: "#6d5efc",
    textDecoration: "none",
  },
  linkHover: {
    textDecoration: "underline",
  },
};

const HelpPage: React.FC = () => {
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Help Center</h1>
        <p style={styles.p}>
          Find quick answers below. This page contains placeholder FAQs.
        </p>

        <details style={styles.details}>
          <summary style={styles.summary}>How do I create a new post?</summary>
          <p style={styles.p}>Go to the Post page, fill in details, and submit.</p>
        </details>

        <details style={styles.details}>
          <summary style={styles.summary}>How do I contact support?</summary>
          <p style={styles.p}>
            Use the contact form or email{" "}
            <a href="mailto:support@example.com" style={styles.link}>
              support@example.com
            </a>
            .
          </p>
        </details>

        <p style={{ marginTop: "24px" }}>
          <a href="/" style={styles.link}>
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  );
};

export default HelpPage;
