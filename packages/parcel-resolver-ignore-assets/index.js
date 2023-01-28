const { Resolver } = require('@parcel/plugin');

module.exports = new Resolver({
    async resolve(resolver_param) {
        const { pipeline, specifier, options: { env } } = resolver_param;
        if (!pipeline && specifier.includes(env.localAssetsPath)) {
            console.log("+++ Resolver excludes: %o", specifier);
            return { isExcluded: true }
        }
        return null;
    },
});