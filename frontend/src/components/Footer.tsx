import { Button } from "antd";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {/* Richard: Placed TrustLens logo from public/logo */}
              <div
                className="w-8 h-8 rounded-2xl overflow-hidden border border-foreground/10 ring-1 ring-black/5 bg-card"
                aria-label="TrustLens"
              >
                <img
                  src="/logo/trustlens_logo.jpeg"
                  alt="TrustLens logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl">TrustLens</span>
            </div>
            <p className="text-muted-foreground">
              Building amazing digital experiences for the modern web.
            </p>
            <div className="flex space-x-4">
              <Button type="text" size="small" icon={<Twitter className="h-4 w-4" />} />
              <Button type="text" size="small" icon={<Github className="h-4 w-4" />} />
              <Button type="text" size="small" icon={<Linkedin className="h-4 w-4" />} />
              <Button type="text" size="small" icon={<Mail className="h-4 w-4" />} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Stay Updated</h4>
            <p className="text-muted-foreground text-sm">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="flex space-x-2">
              <Input placeholder="Enter your email" />
              <Button type="primary" size="middle">Subscribe</Button>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground text-sm" />
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};


