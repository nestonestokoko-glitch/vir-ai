export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose VIR AI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Professional tools designed for creators who want stunning typography reels without the complexity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-indigo-300">
            <div className="flex items-center justify-center h-16 w-16 mb-6 bg-indigo-50 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Quality</h3>
            <p className="text-gray-600">
              Export in HD MP4 format with smooth animations and professional typography rendering
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-indigo-300">
            <div className="flex items-center justify-center h-16 w-16 mb-6 bg-indigo-50 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18m-9 4v9m-9-4v9m9-4V7l4 4 4-4m0 5h.01M9 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy to Use</h3>
            <p className="text-gray-600">
              Intuitive interface with drag-and-drop timeline and real-time preview - no experience needed
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-indigo-300">
            <div className="flex items-center justify-center h-16 w-16 mb-6 bg-indigo-50 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v6a2 2 0 002 2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Optimized</h3>
            <p className="text-gray-600">
              Create vertical 9:16 reels perfect for Instagram, TikTok, and YouTube Shorts
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};