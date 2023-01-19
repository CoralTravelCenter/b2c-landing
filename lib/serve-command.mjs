import * as path from 'path';

import { parceDepsInHTML, parcelFile } from './builder.mjs'

export const command = ['serve <file>', '$0'];
export const describe = '"serve" command description';
export const builder = {
    brand: {
        alias: 'b',
        choices: ['coral', 'sunmar'],
        describe: "Brand name to use for server, currently 'coral' or 'sunmar'"
    }
};
export const handler = (argv => {
    const file2process = path.resolve(argv.file);
    console.log('+++ serve command invoked: file: %o', file2process);

    // parceDepsInFile(file2process);
    parcelFile(argv.file);

});
