const { Resolver } = require('@parcel/plugin');
const { dirname, resolve: resolvePath } = require('path');
const { pathToFileURL } = require('url');

module.exports = new Resolver({
    async resolve(resolver_param) {
        const { pipeline, specifier, options: { env }, dependency } = resolver_param;
        const asset_abs_path = dependency.resolveFrom && resolvePath(dirname(dependency.resolveFrom), specifier.replace(/^~?[\/\\]/, ''));
        if (!specifier) {
            return { isExcluded: true };
        }
        if (asset_abs_path && env.localAssetsPath && pathToFileURL(asset_abs_path).pathname.includes(env.localAssetsPath) && !pipeline) {
            // console.log("+++ Resolver excludes: %o", specifier);
            return { isExcluded: true };
        }
        return null;
    },
});