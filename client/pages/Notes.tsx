import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { decodeToken, getToken, setToken } from "@/lib/auth";

interface Note { id: string; title: string; content: string; createdAt: number; updatedAt: number; }

export default function Notes() {
  const navigate = useNavigate();
  const token = getToken();
  const payload = useMemo(() => decodeToken(token), [token]);
  const [items, setItems] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [canCreate, setCanCreate] = useState(true);
  const [limit, setLimit] = useState(3);
  const isAdmin = payload?.role === "admin";

  useEffect(() => {
    if (!payload) navigate("/");
  }, [navigate, payload]);

  async function load() {
    try {
      const data = await api("/notes");
      setItems(data.items);
      setPlan(data.tenantPlan);
      setCanCreate(data.canCreate);
      setLimit(data.limit);
    } catch (e: any) {
      if (e.status === 401) logout();
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createNote() {
    setLoading(true);
    try {
      await api("/notes", { method: "POST", body: JSON.stringify({ title, content }) });
      setTitle("");
      setContent("");
      await load();
    } catch (e: any) {
      // handled by banner
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    await api(`/notes/${id}`, { method: "DELETE" });
    await load();
  }

  async function upgrade() {
    if (!payload) return;
    await api(`/tenants/${payload.tenantSlug}/upgrade`, { method: "POST" });
    await load();
  }

  function logout() {
    setToken(null);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Notes</h1>
            {payload && (
              <p className="text-xs text-muted-foreground">Tenant: {payload.tenantSlug} • Role: {payload.role}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          {plan === "free" && !canCreate && (
            <Card className="border-amber-300 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900">Free plan limit reached</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-amber-900">Free tenants can create up to {limit} notes. Upgrade to Pro for unlimited notes.</p>
                  {isAdmin ? (
                    <Button onClick={upgrade}>Upgrade to Pro</Button>
                  ) : (
                    <span className="text-xs text-amber-900">Ask an admin to upgrade</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3">
            {items.map((n) => (
              <Card key={n.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{n.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{new Date(n.updatedAt).toLocaleString()}</p>
                  </div>
                  <Button variant="destructive" onClick={() => remove(n.id)}>Delete</Button>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{n.content}</p>
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No notes yet</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Create your first note using the form.</CardContent>
              </Card>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New note {plan === "free" && `(${Math.min(items.length, limit)}/${limit})`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
              <Button onClick={createNote} disabled={!canCreate || loading || !title.trim()}>
                {canCreate ? (loading ? "Creating..." : "Create note") : "Upgrade to create more"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">Current: <strong className="uppercase">{plan}</strong></CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
