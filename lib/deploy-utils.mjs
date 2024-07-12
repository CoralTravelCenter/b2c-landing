import path from "node:path";
import fs from "node:fs";
import figures from "figures";

export function contentIds(contentWidgetId_or_deploymentDescriptor) {
    const contentWidgetId = typeof contentWidgetId_or_deploymentDescriptor === 'string' ? contentWidgetId_or_deploymentDescriptor : contentWidgetId_or_deploymentDescriptor.locations.at(0).widget;
    let [, pageContentId, pageId, contentVersion, widgetIdx, languageId] = contentWidgetId.match(/((Pages_\d+)_PageContents_\d+_V_(\d+))_W_(\d+)_L_(\d+)/);
    contentVersion = Number(contentVersion);
    return { pageContentId, pageId, contentVersion, widgetIdx, languageId }
}

export function idsFromPageContentId(pageContentId) {
    let [, pageId, contentVersion] = pageContentId.match(/(Pages_\d+)_PageContents_\d+_V_(\d+)/);
    contentVersion = Number(contentVersion);
    return { pageId, contentVersion }
}

export function buildDir() {
    return path.join(process.cwd(), '@CMS');
}

export function bundleBasenameForLandingPath(brand, landingName, markup_path) {
    const { name } = path.parse(markup_path);
    return `${ brand }--${ landingName }--${ name }.html`
}

export function bundlePathForLandingPath(brand, landingName, markup_path) {
    return path.join(buildDir(), bundleBasenameForLandingPath(brand, landingName, markup_path));
}

export function getBundlesForLanding(landingName, pageDescriptor) {
    return pageDescriptor.contents.map(markup_path => {
        return {
            cmsTitle: widgetNameForLandingPath(landingName, markup_path),
            source: fs.readFileSync(bundlePathForLandingPath(pageDescriptor.env.brand, landingName, markup_path), { encoding: 'utf8' })
        }
    });
}

export function widgetNameForLandingPath(landingName, markup_path) {
    const { name } = path.parse(markup_path);
    return `${ figures.warning } ${ landingName } | ${ name }`;
}

export function storeDeploymentDescriptor(landingName, pageDescriptor, deploymentDescriptor) {
    const descriptorBasename = `${ pageDescriptor.env.brand }--${ landingName }.deploy.json`;
    const descriptorPath = path.join(buildDir(), descriptorBasename);
    fs.writeFileSync(descriptorPath, JSON.stringify(deploymentDescriptor, null, 4), { encoding: 'utf8' });
}

export function getDeploymentDescriptor(landingName, pageDescriptor) {
    const descriptorBasename = `${ pageDescriptor.env.brand }--${ landingName }.deploy.json`;
    const descriptorPath = path.join(buildDir(), descriptorBasename);
    if (fs.existsSync(descriptorPath)) {
        return JSON.parse(fs.readFileSync(descriptorPath, { encoding: 'utf8' }).toString());
    }
}

export function getAssetsDescriptor(pageDescriptor) {
    const descriptorBasename = `${ pageDescriptor.env.brand }.assets.json`;
    const descriptorPath = path.join(buildDir(), descriptorBasename);
    if (fs.existsSync(descriptorPath)) {
        return JSON.parse(fs.readFileSync(descriptorPath, { encoding: 'utf8' }).toString());
    } else {
        return [];
    }
}

export function storeAssetsDescriptor(pageDescriptor, assetsDescriptor) {
    const descriptorBasename = `${ pageDescriptor.env.brand }.assets.json`;
    const descriptorPath = path.join(buildDir(), descriptorBasename);
    fs.writeFileSync(descriptorPath, JSON.stringify(assetsDescriptor, null, 4), { encoding: 'utf8' });

}

export function hasBeenBuilt(landingName, pageDescriptor) {
    return pageDescriptor.contents.every(content => {
        const { name } = path.parse(content);
        const should_present_in_build = `${ pageDescriptor.env.brand }--${ landingName }--${ name }.html`;
        return fs.existsSync(path.join(buildDir(), should_present_in_build));
    });
}

function bundlesForLandingPageDescriptor(landingName, pageDescriptor) {
    return pageDescriptor.contents.map(content_src => {
        const { name: markup_name } = path.parse(content_src);
        return `${ pageDescriptor.env.brand }--${ landingName }--${ markup_name }.html`;
    });
}