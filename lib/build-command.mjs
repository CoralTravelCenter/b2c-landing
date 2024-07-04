import path from "node:path";
import { parcelSource } from "./builder.mjs";
import { ensureDirSync, outputFileSync } from "fs-extra/esm";
import { globSync } from "glob";
import fs from "node:fs";

export const command = 'build <file>';
export const describe = '"build" command description';
export const builder = {
    'optimize': {
        describe: 'Turn code minification on/off in production mode',
        alias:    'o',
        type:     'boolean',
        default:  true
    },
    'clipboard': {
        describe: 'Whether to copy result to system clipboard',
        alias: 'c',
        type: 'boolean',
        default: true
    }
};
export const handler = (async argv => {
    const file2process = path.resolve(argv.file);
    console.log('+++ build command invoked +++');
    console.log('CWD: %o', process.cwd());
    console.log('SOURCE: %o', argv.file);

    const widgets = await parcelSource(file2process, { mode: 'production', optimize: argv.optimize });

    const outDir = path.join(process.cwd(), '@CMS');
    if (widgets.length) {
        ensureDirSync(outDir);
    }

    const { naming: { brand, page } } = widgets.at(0);
    if (brand && page) {
        const drop_them = globSync(path.join(outDir, `${ brand }--${ page }--*.html`));
        for (const bundle_html of drop_them) {
            fs.unlinkSync(bundle_html);
        }
    }

    for (let { naming, markup } of widgets) {
        let widgetOutPath = path.join(outDir, `${ naming.brand }--${ naming.page }--${ naming.widget }.html`);
        console.log("+++ Writing: %o", widgetOutPath);
        outputFileSync(widgetOutPath, markup, { encoding: 'utf8' });
    }

    if (widgets.length === 1 && argv.clipboard) {
        console.log(`... Copying to clipboard -> '${ widgets[0].naming.brand }-${ widgets[0].naming.page }-${ widgets[0].naming.widget }'`);
        const clipiboard = await import('clipboardy');
        clipiboard.default.writeSync(widgets[0].markup);
    }

    console.log("\nDone.\n");

});
