import Advertisement from "../../components/home/Advertisement";
import Features from "../../components/home/Features";
import MissionVision from "../../components/home/MissionVision";
import HowItWorks from "../../components/home/HowitWorks";

const HomePage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Advertisement />
      <Features />
      <HowItWorks />
      <MissionVision />
    </div>
  );
};

export default HomePage;
