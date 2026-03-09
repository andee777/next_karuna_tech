const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'LinkedIn', 'GitHub'] as const;

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Karuna Technologies. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          {FOOTER_LINKS.map(link => (
            <a key={link} href="#" className="hover:text-foreground transition-colors">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
