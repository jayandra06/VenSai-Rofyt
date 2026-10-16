import type { ReactNode } from "react";

export const metadata = {
  title: "ROFYT Admin",
  description: "VenSai Labs venture admin portal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
