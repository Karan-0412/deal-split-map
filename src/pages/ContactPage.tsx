import React from "react";

const Contact = () => {
  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Contact us</h1>
      <p style={styles.muted}>Have a question? Send us a message below.</p>

      <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="name" style={styles.label}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          required
          style={styles.input}
        />

        <label htmlFor="email" style={styles.label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          style={styles.input}
        />

        <label htmlFor="message" style={styles.label}>
          Message
        </label>
        <textarea
  id="message"
  name="message"
  placeholder="How can we help?"
  required
  style={{
    minHeight: "120px",
    resize: "vertical",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #22232b",
    background: "#0f0f13",
    color: "#f7f7fb"
  }}
></textarea>


        <button type="submit" style={styles.button}>
          Send
        </button>
      </form>

      <p style={{ marginTop: "24px" }}>
        <a href="/" style={styles.link}>
          ← Back to home
        </a>
      </p>
    </div>
  );
};

// Inline styles
const styles = {
  wrap: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "48px 20px",
    background: "#0b0b0c",
    color: "#f7f7fb",
    fontFamily:
      "system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif",
  },
  h1: { fontSize: "40px", margin: "0 0 12px" },
  muted: { color: "#a1a1b3" },
  form: {
    background: "#121216",
    border: "1px solid #22232b",
    borderRadius: "14px",
    padding: "20px",
    marginTop: "16px",
  },
  label: { display: "block", fontWeight: 600, margin: "10px 0 6px" },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #22232b",
    background: "#0f0f13",
    color: "#f7f7fb",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    resize: "vertical",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #22232b",
    background: "#0f0f13",
    color: "#f7f7fb",
  },
  button: {
    marginTop: "14px",
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#6d5efc",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  link: { color: "#6d5efc", textDecoration: "none" },
};

export default Contact;
