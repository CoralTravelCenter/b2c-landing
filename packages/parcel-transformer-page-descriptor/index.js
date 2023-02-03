const { Transformer } = require('@parcel/plugin');
const JSON5 = require('json5');

module.exports = new Transformer({
    async transform({ asset, options, resolve }) {
        const source = await asset.getCode();
        const page_descriptor = JSON5.parse(source);
        let deps = typeof page_descriptor.contents === 'string' ? [page_descriptor.contents] : page_descriptor.contents;
        for (let dep of deps) {
            asset.addDependency({ specifier: dep });
            // asset.invalidateOnFileChange(await resolve(asset.filePath, dep));
        }
        return [asset];
    },
});