

import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";

export default function App({ Component, pageProps }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 max-h-screen overflow-y-auto">
        <div className="min-h-screen md:p-6">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}
