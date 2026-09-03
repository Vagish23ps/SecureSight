import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-deepbrown">
      <div className="max-w-[100rem] mx-auto px-8 md:px-16 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-foreground" />
            <span className="font-heading text-xl text-primary-foreground">SecureFlow</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="font-paragraph text-sm text-primary-foreground">
              © 2026 SecureFlow. All rights reserved.
            </p>
            <p className="font-paragraph text-sm text-primary-foreground/80">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
