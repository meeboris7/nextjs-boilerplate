// app/page.tsx

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>👋 Welcome to My Next.js App!</h1>
      <p>This is the homepage rendered using the App Router.</p>

      <p>
        You can now create other routes inside <code>app/</code>, or add API routes
        in <code>pages/api/</code>.
      </p>

      <p>
        Try creating <code>pages/api/hello.ts</code> for a simple backend endpoint.
      </p>
    </main>
  );
}
