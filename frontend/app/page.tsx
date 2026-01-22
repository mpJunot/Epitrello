'use client';

import { NavigationLink } from '@/components/NavigationLink';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, LayoutGrid, Users, BarChart3, Zap, FolderKanban } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen  w-full">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <span className="text-xl font-bold text-foreground">Epitrello</span>
            </div>
            <div className="flex items-center gap-4">
              <NavigationLink href="/auth/login">
                <Button variant="ghost">Log in</Button>
              </NavigationLink>
              <NavigationLink href="/auth/register">
                <Button>Get started</Button>
              </NavigationLink>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              Manage your projects
              <br />
              <span className="text-primary">with ease</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Epitrello helps teams organize work, track progress, and collaborate effectively.
              Get started in minutes and see the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavigationLink href="/auth/register">
                <Button size="lg" className="text-base px-8">
                  Get started for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </NavigationLink>
              <NavigationLink href="/auth/login">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Log in
                </Button>
              </NavigationLink>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you and your team work more efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Kanban Boards</h3>
              <p className="text-muted-foreground">
                Organize your work with visual boards. Drag and drop cards to track progress and prioritize tasks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Work together seamlessly. Assign tasks, add comments, and keep everyone in the loop.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Track your team&apos;s progress with real-time dashboards and insightful analytics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Fast & Reliable</h3>
              <p className="text-muted-foreground">
                Built for speed. Experience lightning-fast performance with reliable uptime.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Task Management</h3>
              <p className="text-muted-foreground">
                Create, organize, and complete tasks with ease. Set due dates, add labels, and track everything.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Workspaces</h3>
              <p className="text-muted-foreground">
                Organize your projects into workspaces. Keep everything organized and accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams already using Epitrello to manage their projects.
          </p>
          <NavigationLink href="/auth/register">
            <Button size="lg" className="text-base px-8">
              Create your free account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </NavigationLink>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="text-lg font-semibold text-foreground">Epitrello</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
