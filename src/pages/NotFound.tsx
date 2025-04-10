
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-medium mb-3 text-primary">404</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button size="sm" className="h-7 text-xs">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
