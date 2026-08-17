export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Simple 5-step process to create stunning typography reels
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 h-12 w-12 bg-indigo-50 rounded-full">
              <span className="text-indigo-600 font-bold text-xl">1</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Your Text</h3>
              <p className="text-gray-600">
                Type or paste your English text into the editor. The system automatically segments it for optimal animation timing.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 h-12 w-12 bg-indigo-50 rounded-full">
              <span className="text-indigo-600 font-bold text-xl">2</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Style & Animation</h3>
              <p className="text-gray-600">
                Select from professional typography styles and animation presets to match your vision and brand.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 h-12 w-12 bg-indigo-50 rounded-full">
              <span className="text-indigo-600 font-bold text-xl">3</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize & Preview</h3>
              <p className="text-gray-600">
                Adjust colors, timing, positioning, and see your creation in real-time with our live preview.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 h-12 w-12 bg-indigo-50 rounded-full">
              <span className="text-indigo-600 font-bold text-xl">4</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Format</h3>
              <p className="text-gray-600">
                Select portrait (9:16) for social media stories or landscape (16:9) for YouTube and presentations.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 h-12 w-12 bg-indigo-50 rounded-full">
              <span className="text-indigo-600 font-bold text-xl">5</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate & Download</h3>
              <p className="text-gray-600">
                One-click rendering creates your MP4 reel ready for download and sharing across platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};