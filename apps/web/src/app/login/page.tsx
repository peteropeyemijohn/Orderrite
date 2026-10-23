import { en } from "shared";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6">
      <p className="text-3xl font-extrabold text-primary">{en.appName}</p>
      <div className="rounded-card bg-surface p-6 shadow-soft">
        <LoginForm />
      </div>
    </main>
  );
}
