import { JSDOM } from 'jsdom';
import Mustache from 'mustache';
import * as path from 'path';
import { readFileSync } from 'fs';
import { emptyDirSync } from 'fs-extra/esm';
import { pathToFileURL } from 'url'

import { Parcel } from '@parcel/core';
import { appRoot, pageDescriptorWithFile } from "./utils.mjs";

const devOutputDir = 'dev';
const prodOutputDir = 'prod';

export async function parcelAndWatchSource(source_abs_path, env, watcher) {

    const page_descriptor = pageDescriptorWithFile(source_abs_path);
    Object.assign(env, page_descriptor.env);

    emptyDirSync(path.join(process.cwd(), devOutputDir));

    const bundler = new Parcel({
        env,
        mode: 'development',
        entries: [path.relative(process.cwd(), source_abs_path)],
        config: path.join(appRoot, 'config'),
        targets: {
            default: {
                distDir: devOutputDir,
                outputFormat: 'global',
                context: 'browser',
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
            // TODO: buildEvent contain 'changedAssets', try to implement kinda incremental page update
            const widgets = widgetsFromBuildEvent(buildEvent, env);
            const bundles_markup = widgets.map(widget => Mustache.render(env.cmsWidgetContainer, { widget_markup: widget.markup } )).join("\n\n");
            watcher(bundles_markup, env);
        } else if (buildEvent.type === 'buildFailure') {
            console.log(buildEvent.diagnostics);
        }
    });

}

export async function parcelSource(source_abs_path, env) {

    const page_descriptor = pageDescriptorWithFile(source_abs_path);
    Object.assign(env, page_descriptor.env);

    emptyDirSync(path.join(process.cwd(), prodOutputDir));

    const bundler = new Parcel({
        env,
        mode: 'production',
        entries: [path.relative(process.cwd(), source_abs_path)],
        config: path.join(appRoot, 'config'),
        targets: {
            default: {
                context: 'browser',
                distDir: prodOutputDir,
                outputFormat: 'global',
                sourceMap: false,
                optimize: env.optimize ?? true
            }
        }
    });

    return widgetsFromBuildEvent(await bundler.run(), env);

}

function replaceAssetsRefs(markup, env) {
    return env.localAssetsPath ? markup.replaceAll(env.localAssetsPath, env.cdnAssetsURL) : markup;
}

function widgetsFromBuildEvent(buildEvent, env) {
    const { bundleGraph } = buildEvent;
    const bundles = bundleGraph.getBundles();
    const page_bundle = bundles.find(bundle => bundle.type.includes('json'));
    const page_name = page_bundle ? path.parse(page_bundle.filePath).name.replace('\.page', '') : '';
    const html_bundles = bundles.filter(bundle => bundle.type === 'html');
    const widgets = html_bundles.map(hb => {
        const dom = new JSDOM(readFileSync(hb.filePath, { encoding: 'utf8' }));
        const doc = dom.window.document;
        const css_nodes = doc.querySelectorAll('link[rel=stylesheet][href]:not([href^="http"])');
        const script_nodes = doc.querySelectorAll('script[src]:not([src^="http"])');
        const css_tags = Array.from(css_nodes, css_node => {
            const href = css_node.getAttribute('href');
            // const ref_bundle = bundles.find(bundle => href.includes(bundle.name));
            const ref_bundle = bundles.find(bundle => pathToFileURL(bundle.filePath).href.includes(href));
            if (!ref_bundle) debugger;
            css_node.remove();
            return '<style>' + readFileSync(ref_bundle.filePath, { encoding: 'utf8' }) + '</style>';
        });
        const script_tags = Array.from(script_nodes, script_node => {
            const src = script_node.getAttribute('src');
            // const ref_bundle = bundles.find(bundle => src.includes(bundle.name));
            const ref_bundle = bundles.find(bundle => pathToFileURL(bundle.filePath).href.includes(src));
            if (!ref_bundle) debugger;
            script_node.remove();
            return '<script type="text/javascript">' + readFileSync(ref_bundle.filePath, { encoding: 'utf8' }) + '</script>';
        });
        let markup = css_tags.join("\n") + doc.body.innerHTML + script_tags.join("\n");
        if (env.mode === 'production') {
            markup = replaceAssetsRefs(markup, env);
        }
        return {
            naming: {
                brand:  env.brand,
                page:   page_name,
                widget: path.parse(hb.filePath).name.replace(/\..+/,'')
            },
            markup
        };
    });
    return widgets;
}
