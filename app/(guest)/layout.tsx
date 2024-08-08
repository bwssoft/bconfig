import "../globals.css";

export const metadata = {
  title: "BConfig Login Page",
  description: "Created by BSoft",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full bg-white">
      <body className="h-full">{children}</body>
    </html>
  );
}
