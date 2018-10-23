const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('localhost', '5001', { protocol: 'http' })
const glob = require('glob')
const path = require('path')
const fs = require('fs')

async function main() {
  const assetMap = {}

  // Clear the deployment directory
  try {
    await ipfs.files.rm('/tmp/deployment', { recursive: true })
  } catch (e) {}
  await ipfs.files.mkdir('/tmp/deployment/assets', { parents: true })

  // Deploy assets
  for (const file of glob.sync('dist/**/*')) {
    const filepath = `/${path.basename(file)}`
    const content = fs.createReadStream(file)
    const res = await ipfs.files.add([{ path: filepath, content }], {
      wrapWithDirectory: true
    })
    const hash = res.find(x => x.path === '').hash
    const assetPath = path.relative('dist', file)
    assetMap[assetPath] = hash
    console.log('Asset:', '/ipfs/' + hash, `(${assetPath})`)
    await ipfs.files.cp('/ipfs/' + hash, '/tmp/deployment/assets/' + hash, {
      parents: true
    })
  }

  // Generate and deploy the app file
  {
    const indexFile = fs
      .readFileSync('index.html', 'utf8')
      .replace(
        /assetMap: \{\}/,
        () => `assetMap: ${JSON.stringify(assetMap, null, 2)}`
      )
      .replace(
        '<script src="dist/main.js"></script>',
        `<script src="/ipfs/${assetMap['main.js']}/main.js"></script>`
      )
    const res = await ipfs.files.add(
      [{ path: '/app.html', content: Buffer.from(indexFile) }],
      {
        wrapWithDirectory: true
      }
    )
    const hash = res.find(x => x.path === '').hash
    await ipfs.files.cp('/ipfs/' + hash, '/tmp/deployment/app', {
      parents: true
    })
    console.log('App:', '/ipfs/' + hash + '/app.html')
  }

  // Show deployment hash
  {
    const stat = await ipfs.files.stat('/tmp/deployment')
    console.log('Deployment:', '/ipfs/' + stat.hash)
  }
}

process.on('unhandledRejection', up => {
  throw up
})
main()
