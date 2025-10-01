# Robo4Earth Programming Interface

Robo4Earth is a Vite-powered React application that lets students build robot control programs by arranging visual blocks and sending the generated commands to a BBC micro:bit over Web Bluetooth. The interface mimics a drag-and-drop coding environment while remaining small enough to run inside a browser without extra extensions.

## Features

- **Block-based editor** – Drag commands from the block panel into the workspace, reorder chains, and edit block parameters inline.
- **Device connectivity** – Pair with a micro:bit that exposes the Nordic UART service and stream generated command sequences using Web Bluetooth.
- **Program persistence** – Automatically saves block layouts in the browser so learners can continue where they left off.
- **Multilingual UI** – Uses `i18next` to translate block labels, navigation controls, and dialogs.
- **Code view** – Toggle between the block workspace and the textual command representation produced by the converter utilities.

## Project structure

```
├── src
│   ├── components
│   │   ├── ProgrammingInterface.jsx   # Top-level layout and orchestration
│   │   ├── blocks/                    # Block palette definitions
│   │   ├── programming/               # Drag-and-drop workspace
│   │   └── bluetooth/                 # Web Bluetooth connector for micro:bit
│   ├── config/blocksConfig.js         # Block categories and metadata
│   ├── utils/blocksConverter.js       # Converts blocks to robot commands
│   ├── utils/blockStorage.js          # Local storage helpers
│   └── i18n.js                        # i18next configuration and locales
├── index.html                         # Vite entry point
├── package.json                       # Scripts and dependencies
└── vite.config                        # Build tooling configuration
```

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the development server**
   ```bash
   npm run dev
   ```
3. **Open the app** – Visit the URL printed by Vite (typically `http://localhost:5173`).

## Using the interface

1. **Choose a block category** – Use the sidebar to explore motion, sensing, and control blocks defined in `blocksConfig`.
2. **Build a program** – Drag blocks into the programming area. You can nest blocks, adjust numeric inputs, and reorder chains via drag handles.
3. **Review the generated code** – Switch to the code view to inspect the command sequence that will be transmitted to the robot.
4. **Connect to the robot** – Click the connect button in the top navigation, select a nearby device whose name starts with `BBC micro:bit`, and authorize Web Bluetooth access.
5. **Run the program** – Press the execute button to stream commands. The Bluetooth component waits for acknowledgements (`OK`, `UC`, or `STOP`) before moving to the next instruction to ensure reliable delivery.
6. **Stop or clear** – Use the stop or clear controls to interrupt execution and reset the workspace. The layout remains available via local storage unless you clear saved blocks.

## Building for production

```bash
npm run build
```

The optimized build output is generated in `dist/` and can be served with any static host.

## Troubleshooting

- **Bluetooth pairing fails** – Ensure you are running the site over HTTPS (or `localhost`) and that the micro:bit is advertising the Nordic UART service.
- **Programs do not persist** – Verify the browser allows local storage access. The app only restores blocks if saved data exists.
- **Translations are missing** – Check that the desired locale exists under `src/locales/` and that the language detector selects it correctly.

## License

This project inherits its license from the upstream Robo4Earth repository.
