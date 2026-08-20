import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import zlib from "zlib";
import { JSDOM } from "jsdom";
import path from "path";
import os from "node:os";
import { spawn } from "node:child_process";

function decompressBuffer(buffer, encoding) {
    if (encoding === "gzip") return zlib.gunzipSync(buffer);
    if (encoding === "deflate") return zlib.inflateSync(buffer);
    if (encoding === "br") return zlib.brotliDecompressSync(buffer);
    return buffer;
}

export function createMainProxy(page_url) {
    const pageUrl = (typeof page_url === 'string' ? new URL(page_url) : page_url);
    return createProxyMiddleware({
        target: pageUrl.origin,
        changeOrigin: true,
        secure: false,
        // ws:                  true,
        cookieDomainRewrite: { "*": "" },
        on: {
            proxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader("host", pageUrl.host);
            }
        },
    });
}

export function createLandingProxy(page_url, live_template_url, docTransformer) {
    const pageUrl = (typeof page_url === 'string' ? new URL(page_url) : page_url);
    const liveTemplateUrl = (typeof live_template_url === 'string' ? new URL(live_template_url) : live_template_url);
    return createProxyMiddleware({
        target: pageUrl.origin,
        changeOrigin: true,
        secure: false,
        // ws:                  true,
        cookieDomainRewrite: { "*": "" },
        selfHandleResponse: true,
        on: {
            proxyReq: (proxyReq, req, res, options) => {
                proxyReq.setHeader("host", pageUrl.host);
                proxyReq.path = liveTemplateUrl.pathname;
                // proxyReq.setHeader("accept-encoding", "gzip, deflate, br");
            },
            proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
                const contentEncoding = proxyRes.headers["content-encoding"];
                const decompressedHtml = decompressBuffer(responseBuffer, contentEncoding).toString("utf8");

                // const dom = new JSDOM(decompressedHtml.replaceAll(pageUrl.host, 'localhost'));
                const dom = new JSDOM(decompressedHtml);
                const doc = dom.window.document;

                docTransformer?.(doc);

                // --- MANUALLY INJECT BROWSERSYNC SNIPPET ---
                // const bsScript = doc.createElement("script");
                // bsScript.async = true;
                // // BrowserSync serves its client script at this specific path automatically
                // bsScript.src = "/browser-sync/browser-sync-client.js?v=3.0.0";
                //
                // if (doc.body) {
                //     doc.body.appendChild(bsScript);
                // } else {
                //     doc.documentElement.appendChild(bsScript);
                // }
                // --------------------------------------------


                const outputHtml = dom.serialize();
                dom.window.close();

                return outputHtml;

            }),
        }
    });
}

export function widgetsFinder(collection, itemMatcher) {
    if (Array.isArray(collection)) {
        const matchedItem = collection.find(item => itemMatcher(item));
        if (matchedItem) return [matchedItem, collection];
        for (const item of collection) {
            const [nestedItem, nestedCollection] = widgetsFinder(item, itemMatcher);
            if (!!nestedItem) return [nestedItem, nestedCollection];
        }
    }
    if (!!collection && typeof collection === 'object') {
        for (const value of Object.values(collection)) {
            const [nestedItem, nestedCollection] = widgetsFinder(value, itemMatcher);
            if (!!nestedItem) return [nestedItem, nestedCollection];
        }
    }
    return [];
}

// Script `type` values the browser would actually execute. Empty means the tag
// has no type attribute (defaults to JavaScript).
const EXECUTABLE_TYPES = new Set([
    '',
    'text/javascript',
    'application/javascript',
    'text/ecmascript',
    'application/ecmascript',
    'module',
]);

export function scriptTagPacifier(...args) {
    const [script_open_tag] = args;
    const [, script_type] = script_open_tag.match(/\btype=['"](\w*)['"]/) ?? [];
    if (!script_type || EXECUTABLE_TYPES.has(script_type)) {
        return `<script type="text/cms-deferred" data-cms-deferred="1" data-cms-original-type="${ script_type ?? '' }">`;
    }
    return script_open_tag;
}

export function spawnChromeAndOpen(urlToOpen) {
    const targetUrl = new URL(urlToOpen);
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const isolatedDataDir = path.join(os.tmpdir(), 'chrome-isolated-session');
    const dnsRules = [
        `MAP ${ targetUrl.hostname } 127.0.0.1`, // Route a custom dev domain to localhost
    ].join(', ');
    const chromeFlags = [
        `--user-data-dir=${ isolatedDataDir }`,    // Enforce profile isolation
        `--host-resolver-rules=${ dnsRules }`,      // Enforce custom domain resolver configuration
        '--no-first-run',                         // Skip the "Welcome to Chrome" setup screens
        '--no-default-browser-check',             // Bypass prompt to set Chrome as default
        '--ignore-certificate-errors',
        `--unsafely-treat-insecure-origin-as-secure=${ targetUrl.origin }`,
        '--window-position=0,0',       // Snaps the window to the top-left corner of the monitor
        '--window-size=5000,3080',     // Forces the window resolution (adjust to match your Mac screen)

        '--test-type', // 🔕 REMOVES THE UNSUPPORTED CLI WARNING BANNER:

        targetUrl.href          // URL to load immediately upon launch
    ];
    const chromeProcess = spawn(chromePath, chromeFlags, {
        detached: true,
        stdio: 'ignore',
    });

    chromeProcess.unref();

}