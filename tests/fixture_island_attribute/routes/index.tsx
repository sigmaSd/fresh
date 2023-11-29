import { useSignal } from "@preact/signals";
import Counter from "../components/Counter.tsx" with { fresh: "island" };
import { asset, Head } from "$fresh/runtime.ts";

export default function Home() {
  const signal = useSignal(0);
  return (
    <div>
      <Head>
        <link rel="stylesheet" href={asset("/style.css")} />
      </Head>
      <Counter id="counter" count={signal} />
    </div>
  );
}
