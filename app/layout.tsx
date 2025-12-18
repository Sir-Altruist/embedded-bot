import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Your App",
  description: "Your description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}