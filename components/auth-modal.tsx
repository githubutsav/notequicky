"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, Sparkles, User, ShieldCheck, ArrowRight } from "lucide-react"

export function AuthModal({ trigger }: { trigger?: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"signin" | "signup">("signin")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ? trigger : (
        <Button id="auth-modal-trigger" variant="outline" size="sm" className="gap-1.5 font-medium shadow-sm hover:border-primary/40">
          <LogIn className="size-3.5" />
          Log in
        </Button>
      )} />
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/60 bg-background shadow-2xl">
        {/* Header background banner */}
        <div className="relative bg-gradient-to-br from-primary/15 via-muted/40 to-background p-6 border-b border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Sparkles className="size-4" />
            </div>
            <span className="font-bold tracking-tight text-lg">Quicky</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {tab === "signin" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Access your personal notes, highlights, and custom study guides anytime.
          </DialogDescription>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg bg-muted/60 p-1 mt-4 text-xs font-medium border border-border/40">
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 rounded-md py-1.5 transition-all ${
                tab === "signin"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 rounded-md py-1.5 transition-all ${
                tab === "signup"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* OAuth Buttons */}
          <div className="space-y-2.5">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11 border-border/60 hover:bg-accent/40 font-medium"
              onClick={() => signIn("google")}
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11 border-border/60 hover:bg-accent/40 font-medium"
              onClick={() => signIn("github")}
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <div className="relative flex items-center my-3">
            <div className="flex-grow border-t border-border/50"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Or</span>
            <div className="flex-grow border-t border-border/50"></div>
          </div>

          {/* Guest Explore Button */}
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full justify-between h-10 border border-dashed border-border/60 hover:bg-accent/30 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <User className="size-3.5" />
              Explore as Guest (Read Only)
            </span>
            <ArrowRight className="size-3.5" />
          </Button>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Secure 256-bit encrypted authentication</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
