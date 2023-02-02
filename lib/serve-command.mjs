import * as path from 'path';
import * as fs from 'fs';
import JSON5 from 'json5';

import { parcelAndWatchSource, parcelPageWithDescriptor } from './builder.mjs'
import { htmlTagsFromBundleGraph, pageDescriptorWithFile } from "./utils.mjs";

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

    // TODO: env param should contain CLI params ...
    parcelAndWatchSource(file2process, {}, (bundles_markup) => {

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
