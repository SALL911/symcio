import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="flex min-h-[70vh] items-center justify-center bg-bg px-6 py-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
