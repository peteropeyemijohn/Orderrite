import { en } from "shared";
import { ApiStatus } from "@/components/ApiStatus";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">{en.hello.title}</h1>
      <p className="text-lg text-neutral-600">{en.hello.subtitle}</p>
      <ApiStatus />
    </main>
  );
}
