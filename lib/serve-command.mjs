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
            devServer.init({
                https:       true,
                port:        443,
                serveStatic: [process.cwd()],
                directory:   false,
                browser:     process.platform === 'win32' ? 'chrome.exe' : 'Google Chrome',
                open:        true,
                startPath:   '/preview/22fad3a3-92b5-4750-a30f-e7b63f3b46cd/',
                proxy: {
                    target: 'https://www.coral.ru',
                },
                cookies: {
                    stripDomain: true
                },
                proxyRes: [
                    function (proxyRes, req, res) {
                        if (proxyRes.headers['set-cookie']) {
                            proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => {
                                return cookie
                                    // Strip the live site's domain so the browser assigns it to localhost
                                    .replace(/Domain=[^;]+/i, 'Domain=localhost')
                                    // Downgrade SameSite=Strict/Lax to None so localhost can accept it safely
                                    .replace(/SameSite=(Strict|Lax)/i, 'SameSite=None');
                            });
                        }
                    }
                ],
                // middleware: [(req, res, next) => {
                //
                // }],
            });
        }
    });

};
