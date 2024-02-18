import "../styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Koop - AI-Powered Mock Interviews",
  openGraph: {
    title: "Koop - AI-Powered Mock Interviews",
    description:
      "Koop is an AI-powered mock interview platform that helps you practice for your next job interview.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Koop - AI-Powered Mock Interviews",
    description:
      "Koop is an AI-powered mock interview platform that helps you practice for your next job interview.",
  },
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scroll-smooth antialiased [font-feature-settings:'ss01']">
        {children}
      </body>
    </html>
  );
}
