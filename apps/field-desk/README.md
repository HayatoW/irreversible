# Field Desk

An independent 3D study of the field desk by teenage engineering. Three.js
renders the model and provides orbit, zoom, and quick views of the rear frame
and a corner joint.

## Development

From the workspace root, run `vp install` and `vp run field-desk#dev`. Run
`vp run ready` for the workspace checks, tests, and builds.

## Model

The generator uses the dimensions, component diagrams, and assembly order in
the official [product page](https://teenage.engineering/products/field-desk)
and [assembly guide](https://assets.teenage.engineering/_img/63e1fdfdbccffa80d4522cba_original.pdf).
The tabletop thickness, hole diameters, and some connector details are
estimated from the [product photos](https://teenage.engineering/press/field-desk).
The geometry, veneer texture, and still image are generated locally.

Regenerate the checked-in GLB and WebP from the workspace root with Blender 4.5 LTS:

```sh
blender --background --factory-startup --python-exit-code 1 --python apps/field-desk/model/build.py -- --poster
```

Omit `--poster` to export only the GLB. Both assets ship with the app. Running
the site and building it in CI require only the Node.js toolchain.

## Deployment

The `Deploy Field Desk` workflow builds the app and deploys the
`irreversible-field-desk` Worker through Void when the app changes on `main`.
For a local deploy, sign in to the configured Cloudflare account, build with
`vp run field-desk#build`, then run `vp run deploy --dir dist --spa` from this
directory.
