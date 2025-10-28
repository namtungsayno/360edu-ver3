//src/pages/guest/Home.jsx
import { useOutletContext } from "react-router-dom";
import HeroSection from "../../components/common/HeroSection";
import { Footer } from "../../components/common/Footer";

export default function Home() {
  const { onNavigate } = useOutletContext();
  
  return (
    <>
      <HeroSection onNavigate={onNavigate} />
      <Footer />
    </>
  );
}