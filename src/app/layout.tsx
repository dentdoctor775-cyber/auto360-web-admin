import "./globals.css";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "AUTO360",
  description: "AUTO360 Web Admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-full bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
}
