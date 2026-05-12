export const metadata = {
  title: "Sweet AI - Microstock Assistant",
  description: "বন্ধুত্বপূর্ণ চ্যাটবট, মাইক্রোস্টক কোর্স সহায়ক",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, padding: 0, fontFamily: "Segoe UI, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}