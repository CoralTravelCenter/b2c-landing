#!/usr/bin/env node

import fs from "fs";

if (process.env.npm_config_global) {
    fs.symlinkSync('../packages/parcel-resolver-ignore-assets', 'node_modules/parcel-resolver-ignore-assets');
    fs.symlinkSync('../packages/parcel-transformer-page-descriptor', 'node_modules/parcel-transformer-page-descriptor');
}
