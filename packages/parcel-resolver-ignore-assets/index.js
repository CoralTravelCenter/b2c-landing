const { Resolver } = require('@parcel/plugin');
const { dirname, resolve: resolvePath } = require('path');
const { pathToFileURL } = require('url');

module.exports = new Resolver({
    async resolve(resolver_param) {
        const { pipeline, specifier, options: { env }, dependency } = resolver_param;
        console.log("--- pipeline: %o; specifier: %o", pipeline, specifier);
        const asset_abs_path = dependency.resolveFrom && resolvePath(dirname(dependency.resolveFrom), specifier.replace(/^~?\//, ''));
        if (!specifier) {
            return { isExcluded: true };
        }
        console.log("env.localAssetsPath: %o", env.localAssetsPath);
        console.log("pathname: %o", asset_abs_path && pathToFileURL(asset_abs_path).pathname);
        if (asset_abs_path && env.localAssetsPath && pathToFileURL(asset_abs_path).pathname.includes(env.localAssetsPath) && !pipeline) {
            console.log("+++ Resolver excludes: %o", specifier);
            return { isExcluded: true };
        }
        return null;
    },
});