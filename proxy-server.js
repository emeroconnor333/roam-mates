// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// --- Configuration --- (Keep as is)
const VITE_APP_PORT = 5173;
const NEXT_APP_PORT = 3005;
const PROXY_PORT = 8080;
const VITE_APP_URL = `http://localhost:${VITE_APP_PORT}`;
const NEXT_APP_URL = `http://localhost:${NEXT_APP_PORT}`;
const nextPaths = ['/planner', '/_next', '/api']; // Paths handled by Next.js
// ---------------------

const app = express();

console.log(`Proxy target Next.js: ${NEXT_APP_URL}`);
console.log(`Proxy target Vite/React: ${VITE_APP_URL}`);

// --- Filter function for Next.js paths ---
// This function will be called for each request to determine
// if it should be handled by the Next.js proxy rule.
const filterNextPaths = function (pathname, req) {
    // Return true if the pathname starts with any of the prefixes in nextPaths
    return nextPaths.some(pathPrefix => pathname.startsWith(pathPrefix));
};
// -----------------------------------------


// --- IMPORTANT: Order Matters! More specific rules first. ---

// 1. Proxy requests matching the filter function to Next.js
console.log(`Proxying Next.js paths (${nextPaths.join(', ')}) to ${NEXT_APP_URL}`);
// *** Use the filter function as the first argument ***
app.use(createProxyMiddleware(filterNextPaths, { // <--- CHANGE IS HERE
    // Options object is clearly the second argument now
    target: NEXT_APP_URL,
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
    logLevel: 'debug', // Keep debug logs for now
    onError: (err, req, res) => {
        console.error('[Proxy Error - Next.js Target]', err);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end('Proxy error occurred while connecting to Next.js backend.');
    }
}));


// 2. Proxy all other requests (default) to the Vite/React app
console.log(`Proxying default path / to ${VITE_APP_URL}`);
// This rule should only catch requests NOT caught by the filter above
app.use('/', createProxyMiddleware({
    target: VITE_APP_URL,
    changeOrigin: true,
    ws: true, // Keep WebSocket proxying for Vite HMR
    logLevel: 'info',
    onError: (err, req, res) => {
        console.error('[Proxy Error - Vite Target]', err);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end('Proxy error occurred while connecting to Vite backend.');
    }
}));

// Start the proxy server (Keep as is)
app.listen(PROXY_PORT, () => {
    console.log(`\n✅ Simple Reverse Proxy server listening on port ${PROXY_PORT}`);
    console.log(`   Access Vite/React App root via: http://localhost:${PROXY_PORT}`);
    console.log(`   Access Next.js App via paths like: http://localhost:${PROXY_PORT}/planner`);
    console.log(`\nEnsure these dev servers ARE RUNNING:`);
    console.log(`   - Vite/React on port ${VITE_APP_PORT}`);
    console.log(`   - Next.js on port ${NEXT_APP_PORT}`);
});