import HeroSection from "../../modules/HeroSection";
import riderSvg from "../../assets/rider.svg";

const HomePage = () => {
  return (
    <>
      <div>
        <header className="min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-black text-center">
            Welcome to <span className="text-red-500">E-Parcel</span>
          </h1>
          <h3 className="text-2xl font-medium text-center">
            Your trusted online parcel delivery service
          </h3>
          <div className="mt-8">
            <img
              className="object-cover h-175 w-175 mx-auto"
              src={riderSvg}
              alt="Rider"
            />
          </div>
        </header>
      </div>
    </>
  );
};

export default HomePage;
