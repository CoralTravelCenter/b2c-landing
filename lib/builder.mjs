import { JSDOM } from 'jsdom';
import Mustache from 'mustache';
import * as path from 'path';
import * as fs from 'fs';
import app_root from 'app-root-path';

import { Parcel } from '@parcel/core';
import { pageDescriptorWithFile, resolveDependency } from "./utils.mjs";

export async function parcelAndWatchSource(source_abs_path, env, watcher) {

    const page_descriptor = pageDescriptorWithFile(source_abs_path);
    Object.assign(env, page_descriptor.env);

    const bundler = new Parcel({
        env,
        mode: 'development',
        entries: [path.relative(process.cwd(), source_abs_path)],
        config: path.join(app_root.path, 'config'),
        targets: {
            default: {
                distDir: 'dist',
                outputFormat: 'global',
                sourceMap: env.sourcemaps ? {
                    inline: true,
                    inlineSources: true,
                    sourceRoot: '/dist'
                } : false
            }
        }
    });

    const subscription = await bundler.watch((err, buildEvent) => {
        if (err) {
            throw err;
        }
        if (buildEvent.type === 'buildSuccess') {
            const { bundleGraph } = buildEvent;
            const bundles = bundleGraph.getBundles();
            const html_bundles = bundles.filter(bundle => bundle.type === 'html');
            const widgets_markup = html_bundles.map(hb => {
                const dom = new JSDOM(fs.readFileSync(hb.filePath, { encoding: 'utf8' }));
                const doc = dom.window.document;
                const css_nodes = doc.querySelectorAll('link[rel=stylesheet][href]:not([href^="http"])');
                const script_nodes = doc.querySelectorAll('script[src]:not([src^="http"])');
                const css_tags = Array.from(css_nodes, css_node => {
                    const href = css_node.getAttribute('href');
                    const ref_bundle = bundles.find(bundle => href.includes(bundle.name));
                    css_node.remove();
                    return '<style>' + fs.readFileSync(ref_bundle.filePath, { encoding: 'utf8' }) + '</style>';
                });
                const script_tags = Array.from(script_nodes, script_node => {
                    const src = script_node.getAttribute('src');
                    const ref_bundle = bundles.find(bundle => src.includes(bundle.name));
                    script_node.remove();
                    return '<script type="text/javascript">' + fs.readFileSync(ref_bundle.filePath, { encoding: 'utf8' }) + '</script>';
                });
                return css_tags.join("\n") + doc.body.innerHTML + script_tags.join("\n");
            });
            const bundles_markup = widgets_markup.map(widget_markup => Mustache.render(env.cmsWidgetContainer, { widget_markup })).join("\n\n");
            watcher(bundles_markup, env);
        } else if (buildEvent.type === 'buildFailure') {
            console.log(buildEvent.diagnostics);
        }
    });

}

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