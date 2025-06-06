import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4 text-primary">Manage My Parents</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            A supportive community platform for navigating parent-child relationships
            and intergenerational dynamics.
          </p>
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Manage My Parents. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
