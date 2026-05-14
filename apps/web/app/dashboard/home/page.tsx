import Link from 'next/link';
import { ArrowRight, MessageSquare, Users, Zap, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-3xl border border-border bg-card/70 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                Dashboard
              </p>
              <h1 className="heading-1 mt-2 mb-3">Your builder command center</h1>
              <p className="body-large text-muted-foreground max-w-2xl">
                Track collaborators, discussions, and project momentum from one place.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                Back to home <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/posts">
              <div className="card-gradient rounded-2xl border border-border p-6 cursor-pointer hover:shadow-lg transition-shadow h-full">
                <FolderOpen className="mb-4 h-6 w-6 text-blue-600" />
                <h2 className="heading-4 mb-2">Projects</h2>
                <p className="body-small text-muted-foreground">
                  Create, manage, and collaborate on projects.
                </p>
              </div>
            </Link>
            <div className="card-gradient rounded-2xl border border-border p-6">
              <Users className="mb-4 h-6 w-6 text-primary" />
              <h2 className="heading-4 mb-2">People</h2>
              <p className="body-small text-muted-foreground">
                Find teammates and keep your network active.
              </p>
            </div>
            <div className="card-gradient rounded-2xl border border-border p-6">
              <MessageSquare className="mb-4 h-6 w-6 text-accent" />
              <h2 className="heading-4 mb-2">Discussions</h2>
              <p className="body-small text-muted-foreground">
                Jump into conversations and keep projects moving.
              </p>
            </div>
            <div className="card-gradient rounded-2xl border border-border p-6">
              <Zap className="mb-4 h-6 w-6 text-secondary" />
              <h2 className="heading-4 mb-2">Momentum</h2>
              <p className="body-small text-muted-foreground">
                Surface what matters most and act quickly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
