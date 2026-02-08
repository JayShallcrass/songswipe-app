export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg animate-pulse">Loading your gift...</p>
      </div>
    </div>
  )
}
