import path from "path";
import { fatal, pageDescriptorWithFile, success } from "./utils.mjs";

export const command = 'deploy <file>';
export const describe = '"deploy" command description';
export const builder = {
    'new-page': {
        describe: 'Make new CMS page',
        alias:    'N',
        type:     'boolean',
        default:  false
    },
    'new-version': {
        describe: 'Make new CMS page version (default)',
        alias:    'n',
        type:     'boolean',
        default:  true
    },
    'attach': {
        describe: 'Attach deployment to existing page/version',
        alias: 'a',
        type: 'boolean',
        default: false
    }
};
export const handler = (async argv => {
    const file2process = path.resolve(argv.file);
    console.log('+++ deploy command invoked +++');
    console.log('CWD: %o', process.cwd());
    console.log('SOURCE: %o', argv.file);

    const basename = path.basename(file2process, '.json5');
    if (!basename.match(/.page$/)) {
        fatal('Expecting "*.page.json5" file as entry point.');
        return;
    }

    const pageDescriptor = pageDescriptorWithFile(file2process);
    console.log('pageDescriptor: %o', pageDescriptor);

    const buildDir = path.join(process.cwd(), '@CMS');

    if (!hasBeenBuilt(basename.split('.page')[0], pageDescriptor)) {
        fatal("Seems you haven't built this page yet. Invoke 'build' command before deployment");
        return;
    }

    success('Dome.');

});

function hasBeenBuilt(landingName, pageDescriptor) {
    const buildDir = path.join(process.cwd(), '@CMS');
    return pageDescriptor.contents.every(content => {

    });
}