import esbuild from 'esbuild'
import chalk from 'chalk'
import fs from 'fs-extra'

const packageName = 'alpine-sail'
const watch = process.argv.includes('--watch')
const watchOptions = watch ? {} : false

if (watch) {
  watchOptions.onRebuild = function (error) {
    if (!error) {
      console.log(chalk.green('✔'), `Rebuild successful: ${chalk.green.bold(packageName)}`)
      console.log(chalk.blueBright.italic(`  Waiting for changes...`))
      console.log('')
    }
  }
}

// Clean dist
fs.emptyDirSync('dist')

// Browser
esbuild
  .build({
    entryPoints: ['./builds/browser.js'],
    outfile: 'dist/alpine-sail.js',
    bundle: true,
    watch: watchOptions,
    platform: 'browser',
    sourcemap: true,
  })
  .then(() => {
    if (!watch) {
      // Browser (minified)
      esbuild.buildSync({
        entryPoints: ['./builds/browser.js'],
        outfile: 'dist/alpine-sail.min.js',
        bundle: true,
        minify: true,
        platform: 'browser',
        sourcemap: true,
      })

      // ESM (import)
      esbuild.buildSync({
        entryPoints: ['./builds/module.js'],
        outfile: 'dist/alpine-sail.esm.js',
        bundle: true,
        platform: 'neutral',
      })

      // CJS (require)
      esbuild.buildSync({
        entryPoints: ['./builds/module.js'],
        outfile: 'dist/alpine-sail.cjs.js',
        bundle: true,
        platform: 'node',
        target: ['node10.4'],
      })
    }

    // Show success message
    console.log(chalk.green('✔'), `Build successful: ${chalk.green.bold(packageName)}`)

    if (watch) {
      console.log(chalk.blueBright.italic(`  Waiting for changes...`))
    }

    console.log('')
  })
