export default {
          title: 'Principle #2 - Progressive Enhancement',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-teal-400">Do We Even Need JS Here?</h2>
              <div class="max-w-3xl">
                <p class="text-2xl md:text-3xl text-gray-300 mb-6 text-center">✅ Works without JS</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-6 text-center">✅ Enhanced with JS</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-6 text-center">✅ No hydration mismatches</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-8 text-center">✅ Instant first render</p>
              </div>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="w-full max-w-[60vw] md:max-w-md rounded-lg shadow-md">
            </div>
          `
        };