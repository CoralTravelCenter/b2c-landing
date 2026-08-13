import * as path from 'path';
import { spawn } from 'node:child_process';

// import app_root from 'app-root-path';
import { parcelAndWatchSource } from './builder.mjs'
import { create as createDevServer } from 'browser-sync';
import htmlescape from 'htmlescape';
import { createLandingProxy, createMainProxy, scriptTagPacifier, widgetsFinder } from "./serve-utils.mjs";
import * as os from "node:os";

export const command = ['serve <file>', '$0'];
export const describe = '"serve" command description';
export const builder = {
    brand: {
        alias: 'b',
        choices: ['coral', 'sunmar'],
        describe: "Brand name to use for server, currently 'coral' or 'sunmar'"
    },
    sourcemaps: {
        describe: 'Generate sourcemaps in dev mode',
        alias: 'm',
        type: 'boolean',
        default: true
    },

};

export const handler = (argv) => {
    const file2process = path.resolve(argv.file);
    console.log('+++ serve command invoked +++');
    console.log('CWD: %o', process.cwd());
    console.log('SOURCE: %o', argv.file);

    const devServer = createDevServer();
    let recent_markup = [];

    // TODO: env param should contain CLI options ...
    parcelAndWatchSource(file2process, { sourcemaps: argv.sourcemaps }, (bundles_markup, page_env) => {
        recent_markup = Array.isArray(bundles_markup) ? bundles_markup : [bundles_markup];
        if (devServer.active) {
            devServer.reload();
        } else {
            const mainProxy = createMainProxy(page_env.devPageUrl);
            const landingProxy = createLandingProxy(
                page_env.devPageUrl,
                page_env.liveTemplateUrl,
                (doc) => {
                    const next_data_el = doc.getElementById('__NEXT_DATA__');
                    const __next_data__ = JSON.parse(next_data_el?.text ?? '{}');
                    const schema = __next_data__?.props?.pageProps?.layout?.schema;
                    if (schema) {
                        const [next_data_placeholder_widget, next_data_widget_list] = widgetsFinder(schema, (obj) => {
                            return obj?.b2CTitle === page_env.cmsPlaceholderWidgetName;
                        });
                        if (next_data_placeholder_widget) {
                            const place_idx = next_data_widget_list.indexOf(next_data_placeholder_widget);
                            const div = doc.createElement('div');
                            div.innerHTML = next_data_placeholder_widget.widgetData?.content;
                            const placeholder_text = div.innerText;
                            const markup_anchor_el = [...doc.querySelectorAll('[data-widget-type="1"]')]
                                .filter(el => el.innerText === placeholder_text)
                                .at(0);
                            if (markup_anchor_el) {
                                markup_anchor_el.outerHTML = recent_markup
                                    .map(bundle => `<div data-widget-type="1"><div>${ bundle.replace(/<script[^>]*>/g, scriptTagPacifier) }</div></div>`)
                                    .join('');

                                next_data_widget_list.splice(place_idx, 1, ...recent_markup.map(bundle => {
                                    return Object.assign({}, next_data_placeholder_widget, {
                                        widgetData: { content: bundle, type: null }
                                    });
                                }));
                            }
                            next_data_el.text = htmlescape(__next_data__);
                        }
                    }
                }
            );
            devServer.init({
                server: true,
                https: true,
                port: 443,
                serveStatic: [process.cwd()],
                directory: false,
                // browser:     process.platform === 'win32' ? 'chrome.exe' : 'Google Chrome',
                // open:        true,
                open: false,
                // startPath:   new URL(page_env.devPageUrl).pathname,
                middleware: [(req, res, next) => {
                    if (req.url === new URL(page_env.devPageUrl).pathname) {
                        return landingProxy(req, res, next);
                    }
                    return mainProxy(req, res, next);
                }],
            });

            const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            const isolatedDataDir = path.join(os.tmpdir(), 'chrome-isolated-session');
            const dnsRules = [
                'MAP www.coral.ru 127.0.0.1', // Route a custom dev domain to localhost
            ].join(', ');
            const chromeFlags = [
                `--user-data-dir=${ isolatedDataDir }`,    // Enforce profile isolation
                `--host-resolver-rules=${ dnsRules }`,      // Enforce custom domain resolver configuration
                '--no-first-run',                         // Skip the "Welcome to Chrome" setup screens
                '--no-default-browser-check',             // Bypass prompt to set Chrome as default
                '--ignore-certificate-errors',
                '--unsafely-treat-insecure-origin-as-secure=https://www.coral.ru',
                '--window-position=0,0',       // Snaps the window to the top-left corner of the monitor
                '--window-size=5000,3080',     // Forces the window resolution (adjust to match your Mac screen)

                '--test-type', // 🔕 REMOVES THE UNSUPPORTED CLI WARNING BANNER:

                'https://www.coral.ru/zzz/'          // URL to load immediately upon launch
            ];
            const chromeProcess = spawn(chromePath, chromeFlags, {
                detached: true,
                stdio: 'ignore',
            });

            chromeProcess.unref();

        }
    });

};
