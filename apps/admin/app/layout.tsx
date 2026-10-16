import type { ReactNode } from "react";

export const metadata = {
  title: "VenSai Venture Admin",
  description: "admin.vensailabs.in — all VenSai Labs ventures",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
