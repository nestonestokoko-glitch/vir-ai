import { SaasHero } from "@/components/saas-hero";
import { MotionPresets } from "@/components/motion-presets";
import { TypographyShowcase } from "@/components/typography-showcase";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorks } from "@/components/how-it-works";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SaasHero />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Typography Showcase */}
      <TypographyShowcase />

      {/* Animation Showcase */}
      <MotionPresets />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">VIR AI</h3>
              <p className="text-gray-400">
                Transform text into animated typography reels for social media.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 7.33c-.802-1.18-2.022-2-3.405-2h-5.123l1.138-3h-2.97l1.14 3H9.83l1.14-3H4.73l1.138 3H1.66c-1.383 0-2.603.82-3.406 2-.802 1.18-.802 2.707 0 3.888l9.594 14.09c.403.593 1.121.942 1.897.942.775 0 1.494-.349 1.897-.942l9.594-14.09c.801-1.181.801-2.708 0-3.889zm-10.83 12.66l-8.594-12.62 8.594-12.63z"></path>
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 3.414l-1.414-1.414L12 10.586l-4.586-4.586-1.414 1.414L12 13.414l4.586 4.586 1.414-1.414L12 3.414z"></path>
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.466 12c0-3.538-2.876-6.423-6.804-7.375-.83-.242-1.701-.108-2.143.472l-.557.733-.644-.273c-.329-.139-.749-.095-.975.235l-.9.1.64.888c.195.271.348.59.348.925v1.95l1.022-.261c.322-.082.754-.004 1.007.318l1 1.277c.16.205.288.459.288.733v1.73l-.775.966c-.326.407-.658.677-.82 1.008l-.424.902v1.27h2.789l.424-.902v-1.27c-.162-.331-.494-.601-.82-1.008l-.775-.966v-1.73c0-.274.128-.483.288-.733l.64-.888c.226-.313.685-.417 1.007-.318l1.022.261v-1.95c0-.335-.153-.654-.348-.925l-.64-.888c-.225-.33-.145-.475.214-.472C25.342 5.577 22.466 8.462 22.466 12z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; 2026 VIR AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
