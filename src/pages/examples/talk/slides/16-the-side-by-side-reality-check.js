export default {
          title: 'The Side-by-Side Reality Check',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-8 text-green-400">Let's Get Real</h2>
              <div class="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-4xl w-full">
                <table class="w-full text-xl md:text-2xl">
                  <thead>
                    <tr class="border-b-2 border-gray-600">
                      <th class="text-left p-4 text-purple-400">Metric</th>
                      <th class="text-center p-4 text-red-400">Next.js</th>
                      <th class="text-center p-4 text-green-400">Vanilla</th>
                    </tr>
                  </thead>
                  <tbody class="font-mono">
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">Packages installed</td>
                      <td class="text-center p-4 text-red-300">358</td>
                      <td class="text-center p-4 text-green-300 font-bold">1</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">node_modules</td>
                      <td class="text-center p-4 text-red-300">466 MB</td>
                      <td class="text-center p-4 text-green-300 font-bold">1.51 MB</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">Time to Interactive</td>
                      <td class="text-center p-4 text-red-300">~1.9s</td>
                      <td class="text-center p-4 text-green-300 font-bold">~0s</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">Learning Curve</td>
                      <td class="text-center p-4 text-red-300">2 weeks</td>
                      <td class="text-center p-4 text-green-300 font-bold">You know it</td>
                    </tr>
                    <tr>
                      <td class="p-4 text-gray-300">Breaking Changes</td>
                      <td class="text-center p-4 text-red-300">Every 6mo</td>
                      <td class="text-center p-4 text-green-300 font-bold">Never</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="mt-8 text-2xl md:text-3xl text-yellow-400 text-center font-bold">The numbers don't lie.</p>
            </div>
          `
        };