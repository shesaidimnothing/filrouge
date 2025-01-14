import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">Bienvenue</h1>
        <div className="space-y-4">
          <Link href="/signup">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
              S'inscrire
            </button>
          </Link>
          <Link href="/signin">
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}