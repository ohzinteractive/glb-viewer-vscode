# GLB Viewer for VS Code

A Visual Studio Code extension that provides a built-in viewer for GLB (GL Binary) files. This extension allows you to preview and interact with 3D models directly within VS Code.

## Features

- Preview GLB files directly in VS Code
- DRACO support
- Interactive 3D model viewing
- Automatic file association with `.glb` files
- Hierarchy tree and details panel
- Camera focus on object click
- Copy to properties to clipboard
- Extension settings to customize the viewer

## Requirements

- Visual Studio Code version 1.80.0 or higher

## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "GLB Viewer"
4. Click Install

## Usage

1. Open any `.glb` file in VS Code
2. The file will automatically open in the GLB Viewer
3. Interact with the 3D model using your mouse:
   - Left click and drag to rotate
   - Right click and drag to pan
   - Scroll to zoom

## Development

### Prerequisites

- Node.js
- Yarn package manager

### Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:ohzinteractive/vscode-glb-viewer.git
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start development mode:
   ```bash
   yarn dev
   ```

### Build

To build the extension:
```bash
yarn build
```

### Packaging

To package the extension into a VSIX file for distribution:

1. Install the VSCE (Visual Studio Code Extensions) tool globally:
   ```bash
   npm install -g @vscode/vsce
   ```

2. Make sure your extension is built:
   ```bash
   yarn build
   ```

3. Package the extension:
   ```bash
   vsce package
   ```

This will create a `.vsix` file in your project directory. You can then:
- Install it locally by running `code --install-extension ohzi-vscode-glb-viewer-1.0.0.vsix`
- Upload it to the VS Code Marketplace for public distribution
- Share it directly with other users for manual installation

Note: If you plan to publish to the VS Code Marketplace, you'll need to:
1. Create a publisher account on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. Get a Personal Access Token (PAT)
3. Login using `vsce login <publisher-name>`
4. Publish using `vsce publish`

## Project Structure

- `src/` - Source code directory
- `dist/` - Built files
- `extension.js` - Main extension entry point
- `vite.config.mjs` - Vite configuration for building the webview

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
