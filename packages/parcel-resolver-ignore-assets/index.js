const { Resolver } = require('@parcel/plugin');
const { dirname, resolve: resolvePath } = require('path');

module.exports = new Resolver({
    async resolve(resolver_param) {
        const { pipeline, specifier, options: { env }, dependency } = resolver_param;
        const asset_abs_path = dependency.resolveFrom && resolvePath(dirname(dependency.resolveFrom), specifier.replace(/^~?\//, ''));
        if (asset_abs_path && env.localAssetsPath && asset_abs_path.includes(env.localAssetsPath) && !pipeline) {
            // console.log("+++ Resolver excludes: %o", specifier);
            return { isExcluded: true }
        }
        return null;
    },
});