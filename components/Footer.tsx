export default function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {name}. All rights reserved.
        </p>
        <p>Built with Next.js, Tailwind & Supabase.</p>
      </div>
    </footer>
  );
}
