export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">🚨 GAIGI 外疑</h1>
        <p className="text-gray-600">Report Suspicious Things</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <a
          href="/add-report"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition text-center"
        >
          📷 Add Report
        </a>

        <a
          href="/view-map"
          className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition text-center"
        >
          🗺️ View Map
        </a>

        <a
          href="/view-list"
          className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition text-center"
        >
          📋 View List
        </a>
      </div>

      <div className="mt-8">
        <button className="text-gray-600 hover:text-gray-900 underline">
          Login
        </button>
      </div>
    </main>
  );
}
