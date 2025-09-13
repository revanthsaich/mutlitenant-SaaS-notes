import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { decodeToken, setToken } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@acme.test");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Use api utility to ensure token is set and sent correctly
      const body = await (await import("@/lib/api")).api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(body.token);
      const payload = decodeToken(body.token);
      if (!payload) throw new Error("Invalid token");
      navigate("/notes");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-sky-50 dark:from-[#0b0a10] dark:via-[#0f0e18] dark:to-[#0b0a10]">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <a href="/" className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">Multi-tenant Notes</a>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <span>Tenants: Acme, Globex</span>
          <span>Auth: JWT</span>
          <span>Plans: Free vs Pro</span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 grid md:grid-cols-2 gap-10 items-center">
        <section>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            Secure multi-tenant notes with role-based access and instant plan upgrades
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl">
            - Strict tenant isolation (Acme, Globex)
            <br />- JWT authentication with Admin and Member roles
            <br />- Free plan limited to 3 notes, Pro is unlimited
            <br />- Upgrade endpoint: <code className="text-[13px] bg-secondary px-1.5 py-0.5 rounded">POST /tenants/:slug/upgrade</code>
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">admin@acme.test</span>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">user@acme.test</span>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">admin@globex.test</span>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">user@globex.test</span>
            <span className="px-3 py-1 rounded-full bg-accent">password: password</span>
          </div>
        </section>

        <section>
          <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <CardHeader>
              <CardTitle>Log in</CardTitle>
              <CardDescription>Use one of the test accounts to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <p className="text-xs text-muted-foreground">Admin can invite users and upgrade subscriptions. Members can create, view, edit and delete notes within their tenant.</p>
              </form>
              <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                <Button type="button" variant="secondary" onClick={() => setEmail("admin@acme.test")}>admin@acme.test</Button>
                <Button type="button" variant="secondary" onClick={() => setEmail("user@acme.test")}>user@acme.test</Button>
                <Button type="button" variant="secondary" onClick={() => setEmail("admin@globex.test")}>admin@globex.test</Button>
                <Button type="button" variant="secondary" onClick={() => setEmail("user@globex.test")}>user@globex.test</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
