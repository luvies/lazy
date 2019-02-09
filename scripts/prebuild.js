#! /usr/bin/env node
// @ts-check

// This script is used to strip the .ts extensions from imports before
// pushing the files through tsc.
// We have this separate from the Takefile to allow us to rely on node,
// since our main Takefile will be used to test deno running.

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const opts = {
  in: path.resolve(__dirname, '../lib'),
  out: path.resolve(__dirname, '../prebuild'),
  ignore: [],
}

const extRegex = /(from '\..*)(?:\.d)?\.ts(';)$/gm;

/**
 * @param {string} dir
 * @returns {[string, string][]}
 */
function scanFiles(dir) {
  /** @type {[string, string][]} */
  const found = [];

  for (const f of fs.readdirSync(dir)) {
    const ff = path.resolve(dir, f);
    const stats = fs.statSync(path.join(dir, f));
    if (stats.isFile()) {
      found.push([dir, ff]);
    } else if (stats.isDirectory() && !opts.ignore.includes(ff)) {
      found.push(...scanFiles(ff));
    }
  }

  return found;
}

function main() {
  childProcess.execSync(`/bin/sh -c 'mkdir -p ${opts.out}'`);
  childProcess.execSync(`/bin/sh -c 'rm -rf ${opts.out}/*'`);

  const files = scanFiles(opts.in);

  for (const [idir, ifile] of files) {
    const odir = path.resolve(opts.out, path.relative(opts.in, idir));
    const ofile = path.resolve(opts.out, path.relative(opts.in, ifile));

    let contents = fs.readFileSync(ifile).toString();
    contents = contents.replace(extRegex, '$1$2');
    
    childProcess.execSync(`/bin/sh -c 'mkdir -p ${odir}'`);
    fs.writeFileSync(ofile, contents);
  }
}

main();
