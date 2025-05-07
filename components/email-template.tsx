import * as React from "react";

interface EmailTemplateProps {
  name: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  message,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      backgroundColor: "#f9f9f9",
      color: "#333",
      maxWidth: "600px",
      margin: "0 auto",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
    }}>
    <h2 style={{ color: "#444" }}>Olá, {name}!</h2>
    <p style={{ fontSize: "16px", lineHeight: "1.5" }}>{message}</p>

    <hr style={{ margin: "30px 0" }} />

    <footer style={{ fontSize: "12px", color: "#888" }}>
      Esta é uma mensagem automática. Por favor, não responda este e-mail.
    </footer>
  </div>
);
