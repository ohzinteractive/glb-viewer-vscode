# Changelog

All notable changes to the GLB Viewer extension will be documented in this file.

## [2.7.0] - 2025-08-11

### Added
 - Material window
 - Material details window
 - Geometry window
 - Geometry details window
 - Add fov slider in settings

## [2.6.0] - 2025-07-29

### Improved
 - Better instancing compatibility
 - More details in the info panel when using instancing
 - Visibility icons in the hierarchy are now better

## [2.5.0] - 2025-07-28

### Added
 - Support for skeleton visualization
 - Support for skeleton animation

### Improved
 - Texture window now has better organization for texture items

### Fixed
 - Info panel reporting wrong number of vertices

## [2.4.1] - 2025-07-28

### Added
 - Texture preview window

### Improved
 - Hierarchy window

## [2.4.0] - 2025-07-27

### Added
 - New hierarchy icons

## [2.3.0] - 2025-07-25

### Added
 - Origin axis helper for objects and center grid
 - Inspect json button in info panel

### Improved
 - Names in the hierarchy are now properly sorted by name by default

### Fixed
 - Issue when opening info panels on a model with no materials


## [2.2.0] - 2025-07-14

### Improved
 - Reworked texture window
 - Reworked hierarchy window
 - Now when opening the hierarchy, the first 3 levels are expanded
 - Total children count is displayed alongside name

### Fixed
 - Empty objects and bone selections
 - Root object in hierarchy was duplicated

## [2.1.9] - 2025-07-11

### Improved
 - Big improvements to textures panel with new info and UI

### Added
 - Added search functionality to hierarchy
 - Added smooth scrolling to hierarchy when highlighting a node


## [2.1.8] - 2025-07-01

### Improved
 - Increased default height of panels for better visibility


## [2.1.7] - 2025-07-01

### Fixed
 - Fixed textures downloading in linear color space instead of srgb


## [2.1.6] - 2025-07-01

### Fixed
 - Fixed issue when selecting meshes with morph targets only, no skinning

### Updated
 - Updated README.md with latest features


## [2.1.5] - 2025-06-29

### Improved
 - Play window animation when trying to open a window already opened


## [2.1.4] - 2025-06-29

### Fixed
 - Fixed raycast issue selecting invisible meshes


## [2.1.3] - 2025-06-27

### Fixed
 - Fixed issue on models not containing extensions
 - Fixed issue when selecting skinned meshes

### Improved
 - When clicking on a panel button, if the panel is already open, it will shake

## [2.1.2] - 2025-06-14

### Fixed
 - Second instance of the plugin not loading the 3D model
 - Plugin loading slow no start

## [2.1.1] - 2025-06-14

### Fixed
 - Hierarchy icons on empty objects

## [2.1.0] - 2025-06-14

### Improved
 - On startup hierarchy will commence expanded

## [2.0.1] - 2025-06-11

### Improved
 - Opening multiple windows now overlap nicer
 - Improved window style

## [2.0.0] - 2025-06-11

### Improved
- Redesigned UI
- Now SkinnedMesh objects properly display wireframe

## [1.4.0] - 2025-06-11

### Added
- Added a new class for making any window resizable and draggable
- Change UI from tabs to buttons
- Added close button to each panel
- Make each panel focusable and bring it to front when clicked

### Improved
- Better animation control panel and icons
- Extract Animation Item to a separate class
- Fix animation playback speed
- Improve details style
- Move settings to the top right corner

## [1.3.0] - 2025-06-09

### Added
- Added Animations tab

### Improved
- Allow full size texture download
- Better information in the Info tab


## [1.2.0] - 2025-06-05

### Added
- Added ability to preview gpu compressed textures (like ktx2)
- Added Info tab
- Added support for animations
- Added download button for textures
### Improved
- Texture list now displays more information about material relationship.
- Improved texture preview loading time for 4k textures

## [1.1.0] - 2025-06-03

### Added
- Meshoptimizer compression support

### Improved
- Show question to open GLTF files with this extension if it is opened as a text file

## [1.0.6] - 2025-05-30

### Added
 - Draco and ktx2 compression support
 - Texture list in new tab along hierarchy
 - Texture preview

### Improved
 - Show vertex count along object type (if it's a mesh)
 - Now clicking in the expand hierarchy arrow doesn't move the camera


## [1.0.5] - 2025-05-28

### Improved
 - Unified styling across panels

### Added
 - Selection wireframe
 - Global position property (needs to be enabled from settings)

## [1.0.4] - 2025-05-26

### Improved
 - Camera near plane computation

 ## [1.0.3] - 2025-05-26

### Added
- Support for KTX2 textures
- Added global scale to the model
- Add changelog file
- Studio light as default scene lighting, enabling reflections on metallic materials

### Improved
- Compute camera far plane distance

## [1.0.2] - 2025-05-23

### Fixed
- Set the extension as default for .glb files
- Bug fixes and stability improvements

## [1.0.1] - 2025-05-23

### Fixed
- Initial bug fixes and improvements

## [1.0.0] - 2025-05-23

### Added
- Initial release of the GLB Viewer extension
- Support for viewing and exploring GLB files directly in VS Code
- Custom editor integration for .glb files
- 3D model viewer with Three.js integration
- Configurable properties panel for 3D object inspection
- Support for viewing model details including
