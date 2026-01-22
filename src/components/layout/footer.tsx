import { Linkedin, Instagram, Twitter, Github } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Logo />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">© 2025 Donor Connect — Save Lives Together.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
