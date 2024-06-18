#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from 'yargs/helpers';

import * as serveCommand from '../lib/serve-command.mjs'
import * as buildCommand from '../lib/build-command.mjs'
import * as deployCommand from '../lib/deploy-command.mjs'

const argv = yargs(hideBin(process.argv))
    .command(serveCommand)
    .command(buildCommand)
    .command(deployCommand)
    .help()
    .argv;
