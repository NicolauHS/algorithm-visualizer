import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1 className="">Welcome!</h1>
      <Link href="/about">Go to About Page</Link>
    </div>
  );
}
