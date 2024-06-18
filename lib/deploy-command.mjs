import path from "path";

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

    const buildDir = path.join(process.cwd(), '@CMS');


    console.log("\nDone.\n");

});
