import { JSDOM } from 'jsdom';
import * as path from 'path';
import * as fs from 'fs';
import app_root from 'app-root-path';

import { Parcel } from '@parcel/core';
import { resolveDependency } from "./utils.mjs";

function fetchDOMFromFile(file_path) {
    const dom = new JSDOM(fs.readFileSync(file_path, { encoding: 'utf8' }));
    return dom.window.document;
}

export async function parceDepsFromMarkup(file_path, env = {}) {

    const doc = fetchDOMFromFile(file_path);
    const css_nodes = doc.querySelectorAll('link[rel=stylesheet][href]:not([href^="http"])');
    const script_nodes = doc.querySelectorAll('script[type="text/javascript"][src]:not([src^="http"])');
    const css_entries = Array.from(css_nodes, css_node => {
        let css_href = css_node.getAttribute('href');
        css_node.remove();
        return path.resolve(path.dirname(file_path), css_href);
    });
    const js_entries = Array.from(script_nodes, js_node => {
        let js_src = js_node.getAttribute('src');
        js_node.remove();
        return path.resolve(path.dirname(file_path), js_src);
    });

    const bundler = new Parcel({
        env: {
            localAssetsPath: env.localAssetsPath
        },
        entries: [...css_entries, ...js_entries],
        config: path.join(app_root.path, 'config'),
        // defaultTargetOptions: {
        //     outputFormat: 'global',
        //     sourceMaps: true
        // }
    });

    let bundleResult;
    try {
        bundleResult = await bundler.run();
    } catch (ex) {
        console.log(ex);
    }

    return { bundleResult, markupDoc: doc }

}

export async function parcelPageWithDescriptor(page_descriptor, basedir = process.cwd()) {
    const { contents: markup_entries } = page_descriptor;
    const parcels = markup_entries.map(entry => parceDepsFromMarkup(resolveDependency(basedir, entry), page_descriptor.env));
    return await Promise.all(parcels);
}