const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// MIME types for common file extensions
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml',
    '.wasm': 'application/wasm',
};

const ROOT_DIR = __dirname;

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            
            // Try to serve 404.html
            const notFoundPath = path.join(ROOT_DIR, '404.html');
            if (fs.existsSync(notFoundPath)) {
                fs.readFile(notFoundPath, (err404, data404) => {
                    res.end(err404 ? '<h1>404 - Not Found</h1>' : data404);
                });
            } else {
                res.end('<h1>404 - Not Found</h1>');
            }
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 
            'Content-Type': mimeType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    // Parse URL and remove query string
    let urlPath = req.url.split('?')[0];
    
    // Decode URI components
    try {
        urlPath = decodeURIComponent(urlPath);
    } catch (e) {
        // Invalid URL
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
        return;
    }

    // Normalize path
    urlPath = urlPath.replace(/\\/g, '/');
    
    // Prevent directory traversal
    if (urlPath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Build file path
    let filePath = path.join(ROOT_DIR, urlPath);

    // Check if path is a directory
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    // SPA fallback: if file doesn't exist and it's not a static asset, serve index.html
    if (!fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        // If no extension or html, serve index.html for SPA routing
        if (!ext || ext === '.html') {
            filePath = path.join(ROOT_DIR, 'index.html');
        }
    }

    // Log request
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} -> ${path.relative(ROOT_DIR, filePath)}`);

    serveFile(res, filePath);
});

server.listen(PORT, HOST, () => {
    console.log(`\n🚀 Server running at http://${HOST}:${PORT}/`);
    console.log(`   Serving files from: ${ROOT_DIR}`);
    console.log(`\n   Press Ctrl+C to stop\n`);
});
