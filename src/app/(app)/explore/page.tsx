export default function ExplorePage() {
  return (
    <div className="px-4 py-6">
      <h1 className="font-serif text-2xl font-bold text-forest mb-2">Explore</h1>
      <p className="text-sm text-gray-500 mb-8">Discover restaurants near you</p>

      <div className="card p-8 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">
          Map coming soon
        </h2>
        <p className="text-gray-500 text-sm">
          Phase 2 will bring a full map view with restaurant pins,
          search, and location-based discovery.
        </p>
      </div>
    </div>
  );
}
