import path from "node:path";
import Crypto from 'node:crypto'
import { asyncTask, fatal, pageDescriptorWithFile, success, taskHead } from "./utils.mjs";
import { Backoffice, ruLanguageId, statusPublished, statusUnpublished, statusCheckout } from "@coraltravelcenter/backoffice-api";
import lodash from "lodash";
import chalk from "chalk";
import {
    getAssetsDescriptor,
    getBundlesForLanding,
    getDeploymentDescriptor,
    hasBeenBuilt, idsFromPageContentId,
    storeDeploymentDescriptor
} from "./deploy-utils.mjs";
import figures from "figures";
import inquirer from "inquirer";
import { globSync } from "glob";
import fs from "node:fs";

const { pick } = lodash;

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
    'update': {
        describe: 'Update widgets in-place. Overrides --new-version option',
        alias: 'u',
        type: 'boolean',
        default: false
    },
    'extend': {
        describe: 'Extend existing page',
        alias:    'e',
        type:     'boolean',
        default:  false
    },
    'publish': {
        describe: 'Publish page version to live',
        alias:    'p',
        type:     'boolean',
        default:  false
    },
    'links': {
        describe: 'Show preview/published links',
        alias: 'l',
        type: 'boolean',
        default: true
    },
    'assets': {
        describe: 'Sync assets with B2C CDN',
        alias: 'a',
        type: 'boolean',
        default: true
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

    if (argv.update) {
        argv.newVersion = argv.n = false;
    }

    if (argv.assets) {
        taskHead('Syncing assets');

        const assetsAbsPath = path.join(process.cwd(), pageDescriptor.env.localAssetsPath);
        console.log(`Local assets path: ${ chalk.cyan(pageDescriptor.env.localAssetsPath) }`);
        console.log(`CDN URL: ${ chalk.cyan(pageDescriptor.env.cdnAssetsURL) }`);

        const cdn_url = new URL(pageDescriptor.env.cdnAssetsURL);
        console.log('+++ parsed cdn url pathname', cdn_url.pathname);

        const mapped_assets = await asyncTask('Hashing assets', new Promise(resolve => {
            const all_assets = globSync(`${ assetsAbsPath }/**/*`, { nodir: true });
            resolve(all_assets.map(asset_abs_path => {
                return {
                    relativePath: path.relative(assetsAbsPath, asset_abs_path),
                    md5: Crypto.createHash('md5').update(fs.readFileSync(asset_abs_path, { encoding: 'utf8' }), 'utf8').digest('hex')
                }
            }));
        }));

        const assetsDescriptor = getAssetsDescriptor(pageDescriptor);
        const assets2deploy = mapped_assets.filter(asset => {
            return !assetsDescriptor.some(deployed_asset => {
                return deployed_asset.relativePath === asset.relativePath && deployed_asset.md5 === asset.md5;
            });
        });
        console.log(assets2deploy);


        console.log(chalk.yellowBright(`\n${ figures.warning } Exiting for now`));
        process.exit();
    }

    if (argv.extend) {
        taskHead('Extending existing page');
        let pageContent = await backoffice.inquirePageVersion();
        const { layoutAreaId, orderIdx } = await backoffice.inquireWidgetsPlacement(pageContent);

        deploymentDescriptor = { placement: {
                pageContentId: pageContent._id,
                layoutAreaId,
                orderIdx
            }
        };

        if (argv.newVersion) {
            if (![statusPublished, statusUnpublished].includes(chosenPageContent.status)) {
                const { proceedWithoutNewVersion } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'proceedWithoutNewVersion',
                    message: "Can't make a new version. Ok to update?",
                    default: true
                });
                if (!proceedWithoutNewVersion) {
                    console.log(chalk.yellowBright(`\n${ figures.warning } Stopped`));
                    process.exit();
                }
            }
            // making new version
            const { pageContentId: newPageContentId } = await asyncTask('Making new version', backoffice.api.updateStatus(pageContent._id, statusCheckout));
            pageContent = await asyncTask('Fetching new version page content', backoffice.api.getContent(newPageContentId));
            deploymentDescriptor.placement.pageContentId = newPageContentId;
        }

        await asyncTask('Updating page content', upsertContentWidgets(backoffice.api, landingName, pageDescriptor, deploymentDescriptor, pageContent));
        storeDeploymentDescriptor(landingName, pageDescriptor, deploymentDescriptor);

    } else if (!deploymentDescriptor || argv.newPage) {
        // No descriptor OR forced new page from CLI
        taskHead('Creating new page');
        const newPageParams = await backoffice.inquireContentDeploymentParams();
        deploymentDescriptor = { placement: {
                pageContentId: null,
                layoutAreaId: newPageParams.layoutAreaId,
                orderIdx: newPageParams.orderIdx
            }
        };
        // console.log('+++ newPageParams: %o', newPageParams);

        const cmsPageContent = await asyncTask('Creating page', backoffice.api.createPage({
            applicationId: newPageParams.applicationId,
            layoutId:      newPageParams.layoutId,
            name:          newPageParams.pageName
        }).then(({ pageContentId }) => {
            deploymentDescriptor.placement.pageContentId = pageContentId;
            return backoffice.api.getContent(pageContentId);
        }));

        await upsertContentWidgets(backoffice.api, landingName, pageDescriptor, deploymentDescriptor, cmsPageContent);

        storeDeploymentDescriptor(landingName, pageDescriptor, deploymentDescriptor);

    } else if (deploymentDescriptor) {
        taskHead('Updating page');

        const chosenPageContent = await obtainContentToUpdate(backoffice, deploymentDescriptor.placement.pageContentId, argv);

        let shouldUpdateDeploymentDescriptor = false;

        if (chosenPageContent._id !== deploymentDescriptor.placement.pageContentId) {
            deploymentDescriptor.placement.pageContentId = chosenPageContent._id;
            shouldUpdateDeploymentDescriptor = true;
        }

        const result = await asyncTask('Updating page contents', upsertContentWidgets(backoffice.api, landingName, pageDescriptor, deploymentDescriptor, chosenPageContent));

        if (shouldUpdateDeploymentDescriptor) {
            storeDeploymentDescriptor(landingName, pageDescriptor, deploymentDescriptor);
        }

    }

    if (argv.publish) {
        taskHead('Publishing page');

        // const { pageId, pageContentId } = contentIds(deploymentDescriptor);
        const pageContentId = deploymentDescriptor.placement.pageContentId;
        const { pageId } = idsFromPageContentId(pageContentId);

        const pageContent = await asyncTask('Checking page content', backoffice.api.getContent(pageContentId));

        // console.log(pageContent);
        if (pageContent.isPublished) {

        } else {
            const hasRequiredMeta = pageContent.pageContents.every(content => {
                return content.title && content.perma && content.seo?.metaTitle && content.seo?.description;
            });
            if (!hasRequiredMeta) {
                const seoFlags = await backoffice.inquireSEOFlags();
                // console.log(seoFlags);

                const pageMeta = await backoffice.inquirePageMeta(pageId, ruLanguageId);
                // console.log(pageMeta);
                const { pageTitle, metaTitle, metaDescription, permalink } = pageMeta;

                const inherited_props = pick(pageContent, ['publishTime', 'expirationTime', 'priority', 'changeFreq', 'pageContents']);
                const savePageContentQuery = {
                    pageContentId,
                    ...inherited_props,
                    ...seoFlags
                };
                savePageContentQuery.pageContents.forEach(lang_content => {
                    lang_content.title = pageTitle;
                    lang_content.perma = permalink;
                    lang_content.seo.metaTitle = metaTitle;
                    lang_content.seo.description = metaDescription;
                });
                // console.log('+++ just before saving: %o', savePageContentQuery);
                let result = await backoffice.api.savePageContent(savePageContentQuery);

            }

            const result = await backoffice.api.updateStatus(pageContentId, statusPublished);

        }

    }

    if (argv.links && deploymentDescriptor) {
        taskHead('Links');

        const pageContentId = deploymentDescriptor.placement.pageContentId;
        const pageContent = await asyncTask('Fetching page content', backoffice.api.getContent(pageContentId));
        const ru_content = pageContent.pageContents.find(content => content.languageId == ruLanguageId);

        console.log(`Preview: https://www.${ brand }.ru/preview/${ pageContent.uniqueId }/`);
        if (pageContent.isPublished) {
            console.log(`Live: https://www.${ brand }.ru/${ ru_content.perma }`);
        }

    }

    success('Dome.');

});

async function obtainContentToUpdate(backoffice, localPageContentId, argv) {
    const { pageId: localPageId, contentVersion: localContentVersion } = idsFromPageContentId(localPageContentId);
    const pageContentVersions = await asyncTask('Checking page versions', backoffice.api.getContentVersions(localPageId));
    pageContentVersions.sort((a, b) => b.version - a.version);
    const latest = pageContentVersions.at(0);

    let chosenPageContentId;
    const isLocalContentVersionLatest = localContentVersion === latest.version;
    if (isLocalContentVersionLatest) {
        chosenPageContentId = localPageContentId;
    } else {
        console.log(`Your local version ${ chalk.red('(' + localContentVersion + ')') } isn't the latest ${ chalk.green('(' + latest.version + ')') }`);
        chosenPageContentId = await backoffice.inquireContentVersion(pageContentVersions);
    }
    let chosenPageContent = await asyncTask('Fetching page content', backoffice.api.getContent(chosenPageContentId));

    if (argv.newVersion) {
        // Should create new version
        if (![statusPublished, statusUnpublished].includes(chosenPageContent.status)) {
            // Chosen version cant be cloned;
            // Confirm continue w/o new version...
            const { proceedWithoutNewVersion } = await inquirer.prompt({
                type: 'confirm',
                name: 'proceedWithoutNewVersion',
                message: "Can't make a new version. Ok to update?",
                default: true
            });
            if (!proceedWithoutNewVersion) {
                console.log(chalk.yellowBright(`\n${ figures.warning } Stopped`));
                process.exit();
            }
        } else {
            // making new version
            const { pageContentId: newPageContentId } = await asyncTask('Making new version', backoffice.api.updateStatus(chosenPageContentId, statusCheckout));
            chosenPageContent = await asyncTask('Fetching new version page content', backoffice.api.getContent(newPageContentId));
        }
    }

    return chosenPageContent;

}

async function upsertContentWidgets(api, landingName, pageDescriptor, deploymentDescriptor, cmsPageContent, options = {}) {
    const opt = Object.assign({}, options);
    const pageContentId = cmsPageContent._id;

    let cms_widgets = cmsPageContent.pageContents.find(content => content.languageId == ruLanguageId)?.widgets || [];
    cms_widgets = cms_widgets.filter(widget => {
        return (widget.layoutAreaId === deploymentDescriptor.placement.layoutAreaId)
            && widget.cmsTitle.indexOf(`${ figures.warning } ${ landingName } | `) === 0;
    });

    const bundles = getBundlesForLanding(landingName, pageDescriptor);

    let bundles_set_matches_cms_content = bundles.length === cms_widgets.length;
    bundles_set_matches_cms_content &&= bundles.every(bundle => cms_widgets.some(widget => widget.cmsTitle === bundle.cmsTitle));

    if (bundles_set_matches_cms_content) {
        for (const bundle of bundles) {
            const target_widget = cms_widgets.find(widget => widget.cmsTitle === bundle.cmsTitle);
            await asyncTask(`Updating widget [${ target_widget.cmsTitle }]`, api.updateWidget(bundle.cmsTitle, target_widget.contentWidgetId, bundle.source));
        }
    } else {
        // bundles set doesn't match CMS contents
        // remove all widgets matching landing page
        for (const cms_widget of cms_widgets) {
            const query_params = pick(cms_widget, ['contentWidgetId', 'layoutAreaId', 'widgetId']);
            await api.removeWidget(query_params);
        }

        for (const [idx, bundle] of bundles.entries()) {
            const contentWidgetId =  await asyncTask(`Adding widget [${ bundle.cmsTitle }]`,
                api.addWidget({
                    pageContentId: deploymentDescriptor.placement.pageContentId,
                    layoutAreaId: deploymentDescriptor.placement.layoutAreaId,
                    cmsTitle: bundle.cmsTitle,
                    data: { content: bundle.source }
                })
                    .then(() => api.getContent(pageContentId))
                    .then(pageContent => {
                        const { contentWidgetId, order } = pageContent.pageContents.find(content => content.languageId == ruLanguageId)?.widgets.at(-1);
                        const desiredOrder = deploymentDescriptor.placement.orderIdx + 1 + idx;
                        return new Promise(async resolve => {
                            if (desiredOrder !== order) {
                                await api.reorderWidget(contentWidgetId, desiredOrder);
                            }
                            resolve(contentWidgetId);
                        });
                    })
            );
        }
    }


}


