import "./globals.css";
export const metadata = {
  title: "AI Content SaaS",
  description: "Generate viral Instagram content instantly",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        {/* Top Glow Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-pulse" />

        {/* Floating background grid */}
        <div className="fixed inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Main App */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-white/40 py-6">
          Built with AI • SaaS MVP • Groq Powered ⚡
        </footer>

      </body>
    </html>
  );
}