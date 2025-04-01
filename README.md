# Obsidian Sample Plugin
This is a sample plugin for Obsidian (https://obsidian.md).

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.

## Installation
### Manual Installation

1. Download the latest release
2. Copy `main.js`, `styles.css`, and `manifest.json` to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-sample-plugin/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### BRAT (Recommended for Beta Users)
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Click "Add Beta plugin" in BRAT settings
3. Enter `RavenHogWarts/obsidian-sample-plugin`
4. Enable the plugin

## Development

- Clone this repo
- Make sure your NodeJS is at least v16 (`node --version`)
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode

## Support

If you find this plugin helpful, you can support the development through:
- WeChat/Alipay: [QR Code](https://s2.loli.net/2024/05/06/lWBj3ObszUXSV2f.png)

## License

This project is licensed under the LICENSE

