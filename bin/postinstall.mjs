#!/usr/bin/env node

import fs from "fs";

if (!fs.existsSync('node_modules/parcel-resolver-ignore-assets')) {
    fs.symlinkSync('../packages/parcel-resolver-ignore-assets', 'node_modules/parcel-resolver-ignore-assets', 'dir');
}
if (!fs.existsSync('node_modules/parcel-transformer-page-descriptor')) {
    fs.symlinkSync('../packages/parcel-transformer-page-descriptor', 'node_modules/parcel-transformer-page-descriptor', 'dir');
}
