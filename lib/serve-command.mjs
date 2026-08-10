import * as path from 'path';
import * as fs from 'fs';

// import app_root from 'app-root-path';
import { parcelAndWatchSource } from './builder.mjs'
import { create as createDevServer } from 'browser-sync';
import { appRoot } from "./utils.mjs";
import { UAParser } from "browser-sync/dist/utils.js";

import jsesc from 'jsesc'
import { createLandingProxy, createMainProxy } from "./serve-utils.mjs";

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
            const mainProxy = createMainProxy(page_env.devPageUrl);
            const landingProxy = createLandingProxy(
                page_env.devPageUrl,
                page_env.liveTemplateUrl,
                (doc) => {
                    const markup_anchor_el = doc.querySelector('[data-widget-type="1"]');

                }
            );
            devServer.init({
                server:      true,
                https:       true,
                port:        443,
                serveStatic: [process.cwd()],
                directory:   false,
                browser:     process.platform === 'win32' ? 'chrome.exe' : 'Google Chrome',
                open:        true,
                startPath:   new URL(page_env.devPageUrl).pathname,
                middleware:  [(req, res, next) => {
                    if (req.url === new URL(page_env.devPageUrl).pathname) {
                        return landingProxy(req, res, next);
                    }
                    return mainProxy(req, res, next);
                }],
            });
        }
    });

};
