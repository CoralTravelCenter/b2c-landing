import { JSDOM } from 'jsdom';
import * as path from 'path';
import * as fs from 'fs';
import app_root from 'app-root-path';

import { Parcel } from '@parcel/core';

function fetchDOMFromFile(file_path) {
    const dom = new JSDOM(fs.readFileSync(file_path, { encoding: 'utf8' }));
    return dom.window.document;
}

export async function parceDepsInHTML(file_path) {

    const doc = fetchDOMFromFile(file_path);
    const css_nodes = doc.querySelectorAll('link[rel=stylesheet][href]:not([href^="http"])');
    const script_nodes = doc.querySelectorAll('script[type="text/javascript"][src]:not([src^="http"])');
    const css_entries = Array.from(css_nodes, css_node => {
        let css_href = css_node.getAttribute('href');
        return path.resolve(path.dirname(file_path), css_href);
    });
    const js_entries = Array.from(script_nodes, js_node => {
        let js_src = js_node.getAttribute('src');
        return path.resolve(path.dirname(file_path), js_src);
    });
    console.log("+++ css_entries: %o", css_entries);
    console.log("+++ js_entries: %o", js_entries);

    const css_bundler = new Parcel({
        entries: css_entries,
        config: path.join(app_root.path,'config')
    });
    const js_bundler = new Parcel({
        entries: js_entries,
        config: path.join(app_root.path, 'config'),
        defaultTargetOptions: {
            outputFormat: 'global',
            sourceMap: { inline: true }
        }
    });

    try {
        let { bundleGraph: cssBundleGraph, buildTime } = await css_bundler.run();
        console.log("+++ cssBundleGraph: %o", cssBundleGraph);
        let css_bundles = cssBundleGraph.getBundles();
        console.log(`✨ Built ${css_bundles.length} bundles in ${buildTime}ms!`);
    } catch (ex) {
        console.log(ex);
    }
    try {
        let { bundleGraph: jsBundleGraph, buildTime } = await js_bundler.run();
        console.log("+++ jsBundleGraph: %o", jsBundleGraph);
        let js_bundles = jsBundleGraph.getBundles();
        console.log(`✨ Built ${js_bundles.length} bundles in ${buildTime}ms!`);
    } catch (ex) {
        console.log(ex);
    }

}

export async function parcelFile(file_path) {
    const bundler = new Parcel({
        entries: [file_path],
        config: path.join(app_root.path, 'config'),
        defaultTargetOptions: {
            outputFormat: 'global',
            sourceMap: { inline: true }
        }
    });
    try {
        let { bundleGraph, buildTime } = await bundler.run();
        console.log("+++ bundleGraph: %o", bundleGraph);
        let bundles = bundleGraph.getBundles();
        console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
    } catch (ex) {
        console.log(ex);
    }

}