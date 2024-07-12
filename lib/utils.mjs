import { findUpSync, pathExistsSync } from "find-up";
import * as path from 'node:path';
import JSON5 from "json5";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from 'node:url';
import figures from 'figures';
import chalk from "chalk";
import ora from "ora";

const default_assets_dir = 'assets';
const default_assets_path = '';
const default_cdn_assets_url = 'https://cdn.#brand#.ru/content/cms/russia';
const default_cdn_assets_url_by_brand = {
    'coral': 'https://cdn.coral.ru/content/cms/russia',
    'sunmar': 'https://cdn.sunmar.ru/content/cms/russia',
    'coral-next': '//b2ccdn.coral.ru/content/landing-pages',
    'sunmar-next': '//b2ccdn.sunmar.ru/content/landing-pages'
}
const cms_widget_container_template_by_brand = {
    'coral': "<div class=\"widgetcontainer oti-content-typography\">{{{ widget_markup }}}</div>",
    'sunmar': "<div class=\"widgetcontainer oti-content-typography\">{{{ widget_markup }}}</div>",
    'coral-next': '<div>{{{ widget_markup }}}</div>',
    'sunmar-next': '<div>{{{ widget_markup }}}</div>'
}

export function pageDescriptorWithFile(file2process) {
    const { ext: source_ext } = path.parse(file2process);

    let page_descriptor;
    if (source_ext.match(/json5?/)) {
        page_descriptor = JSON5.parse(fs.readFileSync(file2process, 'utf8'));
    } else if (source_ext.match(/html?|pug/)) {
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
        // pd.env.localAssetsPath = local_assets_path && pathToFileURL(path.join(path.sep, path.relative(process_cwd, local_assets_path))).pathname || default_assets_path;
        pd.env.localAssetsPath = local_assets_path && ('/' + path.relative(process_cwd, local_assets_path).replaceAll(path.sep, '/')) || default_assets_path;
    }
    if (!pd.env.cdnAssetsURL) {
        // pd.env.cdnAssetsURL = default_cdn_assets_url.replace('#brand#', pd.env.brand) + '/' + path.basename(process_cwd);
        pd.env.cdnAssetsURL = default_cdn_assets_url_by_brand[pd.env.brand] + '/' + path.basename(process_cwd);
    }
    if (!pd.env.cmsWidgetContainer) {
        // pd.env.cmsWidgetContainer = "<div class=\"widgetcontainer oti-content-typography\">{{{ widget_markup }}}</div>"
        pd.env.cmsWidgetContainer = cms_widget_container_template_by_brand[pd.env.brand];
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

String.prototype.padOrTrimTo = function(width) {
    const free_spaces = width - this.length;
    let str = '';
    if (free_spaces > 0) {
        const add_one = free_spaces % 2;
        const pad = Math.floor(free_spaces / 2);
        const padding = new Array(pad).fill(' ').join('');
        str = padding + this + padding;
        if (add_one) str += ' ';
        return str;
    } else if (free_spaces < 0) {
        return this.substring(0, width);
    }
}

export function fatal(message) {
    console.log("\n" + chalk.red(`${ figures.warning } ${ message }`) + "\n");
}
export function success(message) {
    console.log("\n" + chalk.greenBright(`${ figures.tick } ${ message }`) + "\n");
}

export function taskHead(message) {
    console.log("\n" + chalk.bgBlackBright.yellowBright(message.padOrTrimTo(80)) + "\n");
}

export async function asyncTask(message, promise) {
    const spinner = ora();
    return new Promise(async resolve  => {
        spinner.start(chalk.yellow(message + '...'));
        try {
            const result = await promise;
            spinner.succeed(chalk.green(message));
            resolve(result);
        } catch (ex) {
            spinner.fail(chalk.red(message));
            console.log(ex);
        }
    });
}