
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Users, Lightbulb } from "lucide-react";

const HomePage = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                Manage your parents with ideas from your friends!
              </h1>
              <p className="text-lg md:text-xl mb-10 opacity-90">
                Share challenges, find solutions, and connect with others facing similar
                parent-child dynamics in a safe and supportive environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Link to="/register">Join Our Community</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="mt-10 md:mt-0">
              <img 
                src="/lovable-uploads/1c998e1b-3de5-4859-be85-a15075155f15.png" 
                alt="Diverse young people with thought bubbles showing different expressions in multiple languages" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage My Parents helps you navigate the complexities of parent-child relationships
              with community support and shared solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Share Your Story</h3>
              <p className="text-muted-foreground">
                Post your challenges anonymously and receive support from others who understand.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Connect with Others</h3>
              <p className="text-muted-foreground">
                Find people with similar experiences and build a support network.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Discover Solutions</h3>
              <p className="text-muted-foreground">
                Learn from others' experiences and find approaches that might work for you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-muted py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Community Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <p className="italic mb-4">
                "Finding this community helped me understand my parents' perspective 
                while also validating my own feelings. The advice I received changed our relationship."
              </p>
              <p className="font-medium">Jamie, 22</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <p className="italic mb-4">
                "I never realized how many others were dealing with similar generational 
                differences. The strategies shared here actually worked with my traditional parents."
              </p>
              <p className="font-medium">Alex, 19</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to join our community?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Connect with others navigating similar challenges and find support in a safe, 
            anonymous environment.
          </p>
          <Button asChild size="lg">
            <Link to="/register">Join Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
