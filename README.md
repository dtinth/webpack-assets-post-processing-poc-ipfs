# webpack runtime asset path post-processing use-case example with IPFS

This is an example site built using a webpack setup with a efficient long-term
caching and assets integrity, by deploying assets to IPFS.

- Each asset file is added to IPFS separately. This allows maximum reuse of
  assets.

- Asset integrity is ensured since IPFS is content-addressed — you refer to an
  asset via the hash of its contents.

## Setup overview

1. Run `yarn` to install dependencies.

2. Run `rm -rf dist` to clean up.

3. Run `yarn webpack` to generate the `dist` directory.

   - Note that the generated files in `dist` directory does not contain hashed
     file names. Hashing will be done by IPFS.

   - I used some hacks to allow asset path to be post-processed in runtime.
     Check out [webpack.config.js](webpack.config.js) for more details. This
     will be easier if
     [webpack/webpack#8259](https://github.com/webpack/webpack/issues/8259) is
     available.

4. Run the IPFS daemon: `ipfs daemon`.

<!-- prettier-ignore-start -->

5. Run `node deploy.js` to deploy the site to IPFS.

   - For each asset file in `dist`, the deploy script runs `ipfs add -w` and
     remembers the hash.

     ```
     Asset: /ipfs/QmQhfV2b8Xd3BuFqpBirwL5TpZ1j3QMMCa5DuTwuTwbgvk (1.main.js)
     Asset: /ipfs/QmaTLc5z13kkfJaXjJZhXph8TvFjLZyHDoNN8sAHiStjau (2.main.js)
     Asset: /ipfs/QmbLEsRYuGfwJZdvteL9mtLeh8CnnRiVGDKcgJ6VF3pEGj (jan-vanveen-1115490-unsplash.jpg)
     Asset: /ipfs/QmccB6puYeqWX7Pjg6RAe83u53KsXrCFuUAd4j1ww7LaUv (main.js)
     ```

   - The deployment script reads the `index.html` file, and injects the
     asset-to-IPFS-hash mapping into the HTML file.

      ```js
      AppRuntime = {
        assetMap: {
          "1.main.js": "QmQhfV2b8Xd3BuFqpBirwL5TpZ1j3QMMCa5DuTwuTwbgvk",
          "2.main.js": "QmaTLc5z13kkfJaXjJZhXph8TvFjLZyHDoNN8sAHiStjau",
          "jan-vanveen-1115490-unsplash.jpg": "QmbLEsRYuGfwJZdvteL9mtLeh8CnnRiVGDKcgJ6VF3pEGj",
          "main.js": "QmccB6puYeqWX7Pjg6RAe83u53KsXrCFuUAd4j1ww7LaUv"
        },
        postProcessAssetPath: function (assetPath) {
          var hash = AppRuntime.assetMap[assetPath]
          if (hash) return '/ipfs/' + hash + '/' + assetPath
          return 'dist/' + assetPath
        }
      }
      ```

   - The generated HTML file is added to IPFS.

     ```
     App: /ipfs/QmPT4dE6YpWYa41npCNAzkjjJCBWE5tbjU4QszwuLu1sQm/app.html
     ```

   - Both the HTML file and assets are put into an IPFS directory, which
     represents the deployment. This hash can be pinned on an IPFS node
     to keep the whole deployment online:

     ```
     Deployment: /ipfs/QmU2nGFKSU5GuBhoAUPnUsXhyAhCWk9LkN8qAUfzUzMhTc
     ```

<!-- prettier-ignore-end -->

6. You can now access the site through
   https://cloudflare-ipfs.com/ipfs/QmPT4dE6YpWYa41npCNAzkjjJCBWE5tbjU4QszwuLu1sQm/app.html
