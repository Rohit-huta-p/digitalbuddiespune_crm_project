/* eslint-disable @next/next/no-img-element */
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted dark:bg-zinc-900 dark:text-orange-500 p-6 md:p-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <img className="rounded-md" src="/logo.png" alt="Logo" />
          </div>
          Digital Buddies
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
