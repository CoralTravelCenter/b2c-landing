import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import zlib from "zlib";
import { JSDOM } from "jsdom";

function decompressBuffer(buffer, encoding) {
    if (encoding === "gzip") return zlib.gunzipSync(buffer);
    if (encoding === "deflate") return zlib.inflateSync(buffer);
    if (encoding === "br") return zlib.brotliDecompressSync(buffer);
    return buffer;
}

export function createMainProxy(page_url) {
    const pageUrl = (typeof page_url === 'string' ? new URL(page_url) : page_url);
    return createProxyMiddleware({
        target:              pageUrl.origin,
        changeOrigin:        true,
        secure:              false,
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
        target:              pageUrl.origin,
        changeOrigin:        true,
        secure:              false,
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

                const dom = new JSDOM(decompressedHtml.replaceAll(pageUrl.host, 'localhost'));
                const doc = dom.window.document;

                docTransformer?.(doc);

                // --- MANUALLY INJECT BROWSERSYNC SNIPPET ---
                const bsScript = doc.createElement("script");
                bsScript.async = true;
                // BrowserSync serves its client script at this specific path automatically
                bsScript.src = "/browser-sync/browser-sync-client.js?v=3.0.0";

                if (doc.body) {
                    doc.body.appendChild(bsScript);
                } else {
                    doc.documentElement.appendChild(bsScript);
                }
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