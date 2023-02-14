import { findUpSync, pathExistsSync } from "find-up";
import * as path from 'path';
import JSON5 from "json5";
import fs from "fs";
import { fileURLToPath } from 'url';

const default_assets_dir = 'assets';
const default_assets_path = '';
const default_cdn_assets_url = 'https://cdn.coral.ru/content/cms/russia';

export function pageDescriptorWithFile(file2process) {
    const { ext: source_ext } = path.parse(file2process);

    let page_descriptor;
    if (source_ext.match(/json5?/)) {
        page_descriptor = JSON5.parse(fs.readFileSync(file2process, 'utf8'));
    } else if (source_ext.match(/html?/)) {
        page_descriptor = { contents: file2process };
    }
    conformPageDescriptorToExpectedFormat(page_descriptor, path.dirname(file2process));
    return page_descriptor;
}

export function htmlTagsFromBundleGraph(bundleGraph, bundleType, prefix, suffix) {
    return bundleGraph.getBundles().filter(bundle => bundle.type === bundleType).map(bundle => {
        const bundle_code = fs.readFileSync(bundle.filePath, 'utf8');
        return prefix + bundle_code + suffix;
    }).join("\n");
}

function conformPageDescriptorToExpectedFormat(pd, cwd) {
    let process_cwd = process.cwd();
    if (typeof pd.contents === 'string') {
        pd.contents = [pd.contents];
    }
    if (!pd.env) {
        pd.env = {};
    }
    if (!pd.env.brand) {
        const found_path = findUpSync(p => {
            let { base } = path.parse(p);
            if (['coral.ru', 'coral', 'sunmar.ru', 'sunmar'].includes(base)) {
                return p;
            }
        }, { type: 'directory', cwd: cwd });
        const { name: brand } = found_path ? path.parse(found_path) : {};
        pd.env.brand = brand || 'coral';
    }
    if (!pd.env.pageTemplate) {
        pd.env.pageTemplate = 'content';
    }
    if (!pd.env.localAssetsPath) {
        let local_assets_path = path.join(cwd, default_assets_dir);
        if (!pathExistsSync(local_assets_path)) {
            local_assets_path = findUpSync(default_assets_dir, { type: 'directory', cwd: cwd });
        }
        pd.env.localAssetsPath = local_assets_path && path.join('/', path.relative(process_cwd, local_assets_path)) || default_assets_path;
    }
    if (!pd.env.cdnAssetsURL) {
        pd.env.cdnAssetsURL = default_cdn_assets_url + '/' + path.basename(process_cwd);
    }
    if (!pd.env.cmsWidgetContainer) {
        pd.env.cmsWidgetContainer = "<div class=\"widgetcontainer oti-content-typography\">{{{ widget_markup }}}</div>"
    }
    if (pd.env.sourcemaps === undefined) {
        pd.env.sourcemaps = true;
    }
}

export function resolveDependency(basedir, dep) {
    const path_parts = [];
    if (!path.isAbsolute(basedir)) {
        path_parts.push(process.cwd());
    }
    dep = dep.replace(/^\/+/, '');
    path_parts.push(dep);
    return path.resolve(...path_parts);
}

const module_path = fileURLToPath(import.meta.url);
const found = findUpSync('package.json', { cwd: path.dirname(module_path) })
export const appRoot = path.dirname(found);
