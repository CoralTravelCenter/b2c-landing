
export const command = 'build <file>';
export const describe = '"build" command description';
export const builder = {
    'cdn-base': { alias: 'cdn', describe: 'Assets common URL prefix', demandOption: true, global: true },
    'local-assets-marker': {
        alias:    'assets',
        default:  'iii',
        describe: 'An URL fragment that prepends all references to assets in use',
        global:   true
    },
    'out': {
        alias:    'o',
        default:  '@CMS',
        global:   true,
        describe: 'Output directory'
    },
    'clipboard': {
        describe: 'Whether to copy result to system clipboard',
        alias: 'c',
        type: 'boolean',
        default: true
    }
};
export const handler = (argv => {
    console.log('+++ build command invoked')
});
