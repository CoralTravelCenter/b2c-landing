import path from "node:path";
import fs from 'node:fs'
import { asyncTask, fatal, pageDescriptorWithFile, success, taskHead } from "./utils.mjs";
import { Backoffice, ruLanguageId } from "@coraltravelcenter/backoffice-api";

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
        alias:    'a',
        type:     'boolean',
        default:  false
    },
    'publish': {
        describe: 'Publish page version to live',
        alias: 'p',
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

    let deploymentDescriptor = getDeploymentDescriptor(landingName, pageDescriptor);

    const brand = pageDescriptor.env.brand.split('-')[0];
    let backoffice = await new Backoffice(brand).init();

    let isLocalContentVersionLatest;

    if (!deploymentDescriptor || argv.newPage) {
        // No descriptor OR forced new page from CLI
        deploymentDescriptor = { locations: [] };
        taskHead('Creating new page');
        const newPageParams = await backoffice.inquireContentDeploymentParams();
        // console.log('+++ newPageParams: %o', newPageParams);

        const { pageContentId } = await asyncTask('Creating page', backoffice.api.createPage({
            applicationId: newPageParams.applicationId,
            layoutId: newPageParams.layoutId,
            name: newPageParams.pageName
        }));

        const widget_meta_queries = addWidgetsMetaQueries(landingName, pageDescriptor, pageContentId, newPageParams.layoutAreaId);
        for (const [idx, { meta: widgetMeta, query: widgetQuery }] of widget_meta_queries.entries()) {
            const newContentWidgetId =  await asyncTask(`Adding widget [${ widgetMeta.name }]`,
                backoffice.api.addWidget(widgetQuery)
                    .then(() => backoffice.api.getContent(pageContentId))
                    .then(pageContent => {
                        const { contentWidgetId, order } = pageContent.pageContents.find(content => content.languageId == ruLanguageId)?.widgets.at(-1);
                        const desiredOrder = newPageParams.orderIdx + 1 + idx;
                        return new Promise(async resolve => {
                            if (desiredOrder !== order) {
                                await backoffice.api.reorderWidget(contentWidgetId, desiredOrder);
                            }
                            resolve(contentWidgetId);
                        });
                    })
            );
            deploymentDescriptor.locations.push({
                name: `⚠ ${ widgetMeta.name }`,
                bundle: widgetMeta.bundleBasename,
                widget: newContentWidgetId
            });
            // console.log(newContentWidgetId);
        }
        storeDeploymentDescriptor(landingName, pageDescriptor, deploymentDescriptor);
        isLocalContentVersionLatest = true;
        // console.log(pageContentId);

    } else if (deploymentDescriptor) {
        taskHead('Updating page');

        const { pageId: localPageId, contentVersion: localContentVersion } = contentIds(deploymentDescriptor);

        const pageContentVersions = await asyncTask('Checking page versions', backoffice.api.getContentVersions(localPageId));
        const latest = pageContentVersions.at(0);

        isLocalContentVersionLatest = localContentVersion === latest.version;

    }

    if (argv.publish) {
        taskHead('Publishing page');

        const { pageContentId } = contentIds(deploymentDescriptor);
        const pageContent = await asyncTask('Checking page content', backoffice.api.getContent(pageContentId));

        // console.log(pageContent);
        if (pageContent.isPublished) {

        } else {
            const hasRequiredMeta = pageContent.pageContents.every(content => content.isValid);
            if (!hasRequiredMeta) {
                const seoFlags = await backoffice.inquireSEOFlags();
                console.log(seoFlags);
            }
        }

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
    const descriptorBasename = `${ pageDescriptor.env.brand }--${ landingName }.deploy.json`;
    const descriptorPath = path.join(buildDir, descriptorBasename);
    if (fs.existsSync(descriptorPath)) {
        return JSON.parse(fs.readFileSync(descriptorPath, { encoding: 'utf8' }).toString());
    }
}

function addWidgetsMetaQueries(landingName, pageDescriptor, pageContentId, layoutAreaId) {
    const buildDir = path.join(process.cwd(), '@CMS');
    return pageDescriptor.contents.map(content_src => {
        const { name: markup_name } = path.parse(content_src);
        const bundle_basename = `${ pageDescriptor.env.brand }--${ landingName }--${ markup_name }.html`;
        const bundle_path = path.join(buildDir, bundle_basename);
        const bundle_source = fs.readFileSync(bundle_path, { encoding: 'utf8' }).toString();
        return {
            meta: {
                name: markup_name,
                bundleBasename: bundle_basename
            },
            query: {
                pageContentId,
                layoutAreaId,
                cmsTitle: `⚠ ${ markup_name }`,
                data: { content: bundle_source }
            }
        }
    });
}

function storeDeploymentDescriptor(landingName, pageDescriptor, deploymentDescriptor) {
    const buildDir = path.join(process.cwd(), '@CMS');
    const descriptorBasename = `${ pageDescriptor.env.brand }--${ landingName }.deploy.json`;
    const descriptorPath = path.join(buildDir, descriptorBasename);
    fs.writeFileSync(descriptorPath, JSON.stringify(deploymentDescriptor, null, 4), { encoding: 'utf8' });
}

function contentIds(contentWidgetId_or_deploymentDescriptor) {
    const contentWidgetId = typeof contentWidgetId_or_deploymentDescriptor === 'string' ? contentWidgetId_or_deploymentDescriptor : contentWidgetId_or_deploymentDescriptor.locations.at(0).widget;
    let [,pageContentId, pageId, contentVersion, widgetIdx, languageId] = contentWidgetId.match(/((Pages_\d+)_PageContents_\d+_V_(\d+))_W_(\d+)_L_(\d+)/);
    contentVersion = Number(contentVersion);
    return { pageContentId, pageId, contentVersion, widgetIdx, languageId }
}