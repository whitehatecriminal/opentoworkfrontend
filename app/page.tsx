import Navbar from "@/src/components/Navbar";
import HomeHero from "@/src/components/Hero/homehero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      <HomeHero />
    </main>
  );
}
