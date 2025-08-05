import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to PlayJelly</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your platform for amazing experiences
        </p>
        <Link to="/status">
          <Button variant="default" size="lg">
            View System Status
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;