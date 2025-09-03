import React from "react";

const AboutPage = () => {
  return (
    <div className="wrap">
      <header>
        <h1>About us</h1>
        <p className="lead">
          We’re on a mission to make sharing and saving effortless.
        </p>
      </header>

      <section className="card">
        <p>
          This is a placeholder About page for DealSplit. Add your company story,
          values, and the journey that brought your team together. Describe what
          makes your product unique and how it creates value for your community.
        </p>
        <p>
          You can also include your milestones, press mentions, and a brief intro
          to the team behind the product.
        </p>
      </section>

      <p style={{ marginTop: "24px" }}>
        <a href="/">← Back to home</a>
      </p>

      {/* Styles moved inside JSX */}
      <style>{`
        :root {
          --bg: #0b0b0c;
          --card: #121216;
          --text: #f7f7fb;
          --muted: #a1a1b3;
          --primary: #6d5efc;
          --border: #22232b;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background: var(--bg);
          color: var(--text);
          font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,
            Cantarell, Noto Sans, sans-serif;
        }
        .wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 48px 20px;
        }
        header {
          margin-bottom: 24px;
        }
        h1 {
          font-size: 40px;
          margin: 0 0 12px;
        }
        p.lead {
          color: var(--muted);
          font-size: 18px;
          margin: 0 0 32px;
        }
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
        }
        a {
          color: var(--primary);
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
