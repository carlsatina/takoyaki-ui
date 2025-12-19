#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const bumpArg = args[0] || 'patch'
const shouldSync = args.includes('--sync')

const pkgPath = path.join(projectRoot, 'package.json')
const lockPath = path.join(projectRoot, 'package-lock.json')
const androidGradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle')
const iosPlistPath = path.join(projectRoot, 'ios', 'App', 'App', 'Info.plist')

const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const run = (cmd) => execSync(cmd, { cwd: projectRoot, stdio: 'inherit' })

const updateAndroidVersion = (version) => {
  if (!fs.existsSync(androidGradlePath)) {
    console.warn('Android build.gradle not found, skipping Android version bump.')
    return
  }

  let content = fs.readFileSync(androidGradlePath, 'utf8')

  content = content.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`)
  content = content.replace(/versionCode\s+(\d+)/, (_, code) => `versionCode ${Number(code) + 1}`)

  fs.writeFileSync(androidGradlePath, content, 'utf8')
  console.log(`Updated Android versionName to ${version} and incremented versionCode.`)
}

const updateIosVersion = (version) => {
  if (!fs.existsSync(iosPlistPath)) {
    console.warn('iOS Info.plist not found, skipping iOS version bump.')
    return
  }

  let content = fs.readFileSync(iosPlistPath, 'utf8')

  content = content.replace(
    /<key>CFBundleShortVersionString<\/key>\s*<string>[^<]+<\/string>/,
    `<key>CFBundleShortVersionString</key><string>${version}</string>`
  )

  content = content.replace(
    /<key>CFBundleVersion<\/key>\s*<string>([^<]+)<\/string>/,
    (_, build) => `<key>CFBundleVersion</key><string>${Number(build) + 1}</string>`
  )

  fs.writeFileSync(iosPlistPath, content, 'utf8')
  console.log(`Updated iOS CFBundleShortVersionString to ${version} and incremented CFBundleVersion.`)
}

const bump = () => {
  if (!fs.existsSync(pkgPath)) {
    console.error('package.json not found. Run this script from the frontend directory.')
    process.exit(1)
  }

  const before = readJSON(pkgPath).version
  try {
    run(`npm version ${bumpArg} --no-git-tag-version`)
  } catch (err) {
    console.error('npm version failed. Check your bump argument (patch|minor|major|x.y.z).')
    process.exit(1)
  }

  const after = readJSON(pkgPath).version
  console.log(`Version bumped: ${before} -> ${after}`)

  // Ensure lockfile is kept in sync if it exists
  if (fs.existsSync(lockPath)) {
    const lock = readJSON(lockPath)
    if (lock.version !== after) {
      lock.version = after
      fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf8')
    }
  }

  updateAndroidVersion(after)
  updateIosVersion(after)

  if (shouldSync) {
    run('npx cap sync')
  }
}

bump()
