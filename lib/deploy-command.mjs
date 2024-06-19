import path from "node:path";
import fs from 'node:fs'
import { fatal, pageDescriptorWithFile, success, taskHead } from "./utils.mjs";
import { Backoffice } from "@coraltravelcenter/backoffice-api";
import { inquireContentDeploymentParams } from "../../backoffice-api/lib/inquirers.mjs";

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
    // console.log('pageDescriptor: %o', pageDescriptor);

    const landingName = basename.split('.page')[0];

    if (!hasBeenBuilt(landingName, pageDescriptor)) {
        fatal("Seems you haven't built this page yet. Invoke 'build' command before deployment");
        return;
    }

    const deploymentDescriptor = getDeploymentDescriptor(landingName, pageDescriptor);

    let backoffice;
    const brand = pageDescriptor.env.brand.split('-')[0];

    if (!deploymentDescriptor || argv.N) {
        // No descriptor OR forced new page from CLI
        taskHead('Creating new page');
        backoffice ||= await new Backoffice(brand).init();
        const newPageParams = await backoffice.inquireContentDeploymentParams();

        const { pageContentId } = await backoffice.api.createPage({
            applicationId: newPageParams.applicationId,
            layoutId: newPageParams.layoutId,
            name: newPageParams.pageName
        });

        console.log(pageContentId);

    }

    success('Dome.');

});

function hasBeenBuilt(landingName, pageDescriptor) {
    const buildDir = path.join(process.cwd(), '@CMS');
    return pageDescriptor.contents.every(content => {
        const { name } = path.parse(content);
        const should_present_in_build = `${ pageDescriptor.env.brand }--${ landingName }--${ name }.html`;
        return fs.existsSync(path.join(buildDir, should_present_in_build));
    });
}

function getDeploymentDescriptor(landingName, pageDescriptor) {
    const buildDir = path.join(process.cwd(), '@CMS');
    const descriptorBasename = `${ pageDescriptor.env.brand }--${ landingName }.json`;
    const descriptorPath = path.join(buildDir, descriptorBasename);
    if (fs.existsSync(descriptorPath)) {
        return JSON.parse(fs.readFileSync(descriptorPath, { encoding: 'utf8)' }).toString());
    }
}