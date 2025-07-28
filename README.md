# GLTF/GLB Viewer for VS Code

A Visual Studio Code extension that provides a built-in viewer for GLTF or GLB files. This extension allows you to preview and interact with 3D models directly within VS Code.

![Preview](https://github.com/ohzinteractive/vscode-glb-viewer/blob/main/previews/preview-2.1.1.png?raw=true)

## Usage

1. Click on any `.gltf .glb` file in VS Code's explorer window
2. The file will be opened automatically in a new tab using the GLTF/GLB Viewer
   - If that doesn't happen, you can right click manually on the file and choose 'open with:' GLTF/GLB Viewer
   - From the "open with" menu, you can also configure the default viewer to be this one
3. Interact with the 3D model using your mouse:
   - Left click and drag to rotate
   - Right click and drag to pan
   - Scroll to zoom

## Features

- Inspect GLTF/GLB files directly in VS Code in a 3D viewer
- Automatic file association with `.gltf .glb` files
- Interactive 3D model viewing
- DRACO compression support
- KTX2 support (GPU Texture Compression)
- Hierarchy, Animations, Textures and Info panels
- Play and stop individual animations
- Visualize textures, their resolution, and their relationship and usage with the materials
- Download textures
- Get a quick general understanding of the number of geometries, vertices, materials, textures, animations, etc.
- Camera auto focus focus on any object when clicked
- Copy to properties to clipboard with a single click
- Extra tools to visualize information like normals, object origins, and more.
- Quick search through the hierarchy tree


## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "GLTF/GLB Viewer"
4. Click Install


## 📜 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for details about each release.

## Requirements

- Visual Studio Code version 1.80.0 or higher



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
   Inside vscode with the folder open, press F5 to start the extension. This will open a new window with the extension running.
   Under the hood, it will run the `yarn start` command. That builds and watches for changes in the `src/` folder.

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
