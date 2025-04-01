English | [中文](./README-zh.md)

# Yearly Glance

Yearly event overview with customizable management.

## Installation
### Manual Installation

1. Download the latest release
2. Copy `main.js`, `styles.css`, and `manifest.json` to your vault's plugins folder: `<vault>/.obsidian/plugins/yearly-glance/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### BRAT (Recommended for Beta Users)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Click "Add Beta plugin" in BRAT settings
3. Enter `Moyf/yearly-glance`
4. Enable the plugin

## Development

- Clone this repo
- Make sure your NodeJS is at least v18 (`node --version`)
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode
- `npm run build` to build the plugin
- `npm run build:local` to build the plugin and copy it to your vault's plugins folder(need create a .env file in the project root and add the line: VAULT_PATH=/path/to/your/vault)
- `npm run version` to bump the version number and update the manifest.json, version.json, package.json
- `npm run release` to build the plugin and bump the version number

## Support

If you encounter any issues or have suggestions:
- [Open an issue](https://github.com/Moyf/yearly-glance/issues) on GitHub
- [Join the discussion](https://github.com/Moyf/yearly-glance/discussions) for questions and ideas

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

