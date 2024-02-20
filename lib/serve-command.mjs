import * as path from 'path';
import * as fs from 'fs';

// import app_root from 'app-root-path';
import { parcelAndWatchSource } from './builder.mjs'
import { create as createDevServer } from 'browser-sync';
import { appRoot } from "./utils.mjs";
import { UAParser } from "browser-sync/dist/utils.js";

import jsesc from 'jsesc'

export const command = ['serve <file>', '$0'];
export const describe = '"serve" command description';
export const builder = {
    brand: {
        alias:    'b',
        choices:  ['coral', 'sunmar'],
        describe: "Brand name to use for server, currently 'coral' or 'sunmar'"
    },
    sourcemaps: {
        describe: 'Generate sourcemaps in dev mode',
        alias:    'm',
        type:     'boolean',
        default:  true
    },

};

export const handler = (argv) => {
    const file2process = path.resolve(argv.file);
    console.log('+++ serve command invoked +++');
    console.log('CWD: %o', process.cwd());
    console.log('SOURCE: %o', argv.file);

    const devServer = createDevServer();
    let recent_markup = '';

    // TODO: env param should contain CLI options ...
    parcelAndWatchSource(file2process, { sourcemaps: argv.sourcemaps }, (bundles_markup, page_env) => {
        recent_markup = bundles_markup;
        if (devServer.active) {
            devServer.reload();
        } else {
            let template_root = path.join(appRoot, 'lib/web-root', page_env.brand);
            const indexPath = path.join(template_root, `${ page_env.pageTemplate }.html`);
            devServer.init({
                server: {
                    baseDir: template_root,
                    index:   `${ page_env.pageTemplate }.html`,
                },
                middleware: [(req, res, next) => {
                    if (req.url === '/') {
                        if (!fs.existsSync(indexPath)) {
                            const { device: { type: deviceType } } = UAParser(req.headers['user-agent']);
                            let responsivePath;
                            let isMobile = ['mobile', 'tablet'].includes(deviceType);
                            responsivePath = path.join(template_root, `${ page_env.pageTemplate }.${ isMobile ? 'mobile' : 'desktop' }.html`);
                            const indexFileBuffer = fs.readFileSync(responsivePath);
                            res.contentType = 'text/html';
                            res.end(
                                indexFileBuffer.toString()
                                .replace('<!-- PAYLOAD PLACEHOLDER -->', recent_markup)
                                .replace('<!-- ESCAPED PAYLOAD PLACEHOLDER -->', jsesc(recent_markup, {
                                    quotes: 'double',
                                    isScriptContext: true,
                                    json: true
                                }))
                            );
                        } else next();
                    } else next();
                }],
                https:        true,
                port:         443,
                serveStatic:  [template_root, process.cwd()],
                rewriteRules: [
                    { match: '<!-- PAYLOAD PLACEHOLDER -->', replace: () => recent_markup }
                ],
                directory:    false,
                browser:      process.platform === 'win32' ? 'chrome.exe' : 'Google Chrome',
            });
        }
    });

};
