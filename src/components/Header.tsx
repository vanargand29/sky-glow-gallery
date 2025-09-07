import { Link, useLocation } from "react-router-dom";
import { Star } from "lucide-react";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Sky: Children of The Light", path: "/sky" },
    { name: "Roblox", path: "/roblox" },
    { name: "Review", path: "/review" },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-accent">J Store</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === item.path
                    ? "text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;