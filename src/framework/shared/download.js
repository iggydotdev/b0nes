// src/utils/download.js
/**
 * Trigger a file download in the browser
 * @param {string} content - File content (string)
 * @param {string} filename - Name of the downloaded file (e.g., 'site.js')
 * @param {string} type - MIME type (default: 'text/javascript')
 */
export const download = (content, filename, type = 'text/javascript') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};