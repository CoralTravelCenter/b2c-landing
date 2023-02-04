import * as path from 'path';

import app_root from 'app-root-path';
import { parcelAndWatchSource, parcelPageWithDescriptor } from './builder.mjs'
import { htmlTagsFromBundleGraph, pageDescriptorWithFile } from "./utils.mjs";
import { create as createDevServer } from 'browser-sync';

export const command = ['serve <file>', '$0'];
export const describe = '"serve" command description';
export const builder = {
    brand: {
        alias:    'b',
        choices:  ['coral', 'sunmar'],
        describe: "Brand name to use for server, currently 'coral' or 'sunmar'"
    }
};

export const handler = (argv) => {
    const file2process = path.resolve(argv.file);
    console.log('+++ serve command invoked +++');
    console.log('CWD: %o', process.cwd());
    console.log('SOURCE: %o', argv.file);

    const devServer = createDevServer();
    let recent_markup = '';

    // TODO: env param should contain CLI options ...
    parcelAndWatchSource(file2process, {}, (bundles_markup, page_env) => {
        recent_markup = bundles_markup;
        if (devServer.active) {
            devServer.reload();
        } else {
            let template_root = path.join(app_root.path, 'lib/web-root', page_env.brand);
            devServer.init({
                server: {
                    baseDir: template_root,
                    index:   `${ page_env.pageTemplate }.html`,
                },
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

const old_handler = async (argv) => {
    const file2process = path.resolve(argv.file);
    console.log('+++ serve command invoked: file: %o', file2process);

    let page_descriptor = pageDescriptorWithFile(file2process);

    const page_parcels = await parcelPageWithDescriptor(page_descriptor, path.dirname(file2process));

    page_parcels.map(page_parcel => {
        const {
            bundleResult: { bundleGraph: bundle_graph },
            // cssBundleResult:    { bundleGraph: css_bundle_graph },
            // scriptBundleResult: { bundleGraph: scripts_bundle_graph },
            markupDoc
        } = page_parcel;

        const style_tags = htmlTagsFromBundleGraph(bundle_graph, 'css', '<style>', '</style>')
        const script_tags = htmlTagsFromBundleGraph(bundle_graph, 'js', '<script type="text/javascript">', '</script>')

    });

};
