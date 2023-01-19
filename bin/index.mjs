#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from 'yargs/helpers';

import * as serveCommand from '../lib/serve-command.mjs'
import * as buildCommand from '../lib/build-command.mjs'

const argv = yargs(hideBin(process.argv))
    .command(serveCommand)
    .command(buildCommand)
    .help()
    .argv;
