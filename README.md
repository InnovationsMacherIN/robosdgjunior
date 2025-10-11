# Robo4Earth Programming Interface

Robo4Earth is a web-based, visual programming environment designed to teach students the fundamentals of robotics and coding. Built with React and Vite, this application provides an intuitive drag-and-drop interface for building robot control programs. Users can create programs by arranging visual blocks, which are then converted into commands and sent to a BBC micro:bit via Web Bluetooth.

## Features

- **Visual Block-Based Editor**: Drag and drop command blocks to build programs, reorder them, and configure their parameters.
- **Real-Time Device Connectivity**: Pair with a micro:bit device using Web Bluetooth to send commands and control the robot in real time.
- **Program Persistence**: Automatically saves your block layouts to the browser's session storage, allowing you to pick up where you left off.
- **Multilingual User Interface**: Supports multiple languages, including English, German, Finnish, and Japanese, using `i18next`.
- **Code Preview**: Toggle between the visual block editor and a textual representation of the generated code in both JavaScript and Python.
- **Zoom and Pan**: Navigate the programming area with ease using zoom and pan controls, designed for both mouse and touch input.

## Project Structure

The project is organized into the following directory structure:

```
├── src
│   ├── assets
│   │   ├── icons/
│   │   └── fonts/
│   ├── components
│   │   ├── ProgrammingInterface.jsx   # Main application component
│   │   ├── blocks/
│   │   ├── bluetooth/
│   │   ├── navigation/
│   │   └── programming/
│   ├── config
│   │   ├── blocksConfig.js            # Configuration for block categories and properties
│   │   └── blockIconConfig.jsx        # Maps block types to icons
│   ├── locales
│   │   └── translations.js            # Language translations
│   ├── styles
│   │   ├── components/
│   │   ├── global.css
│   │   └── variables.css
│   ├── utils
│   │   ├── blocksConverter.js         # Converts blocks to robot commands
│   │   ├── blockStorage.js            # Session storage helpers
│   │   └── useTouchDrag.js            # Custom hook for touch-based drag and drop
│   ├── i18n.js                        # i18next configuration
│   └── main.jsx                       # Application entry point
├── index.html                         # Main HTML file
├── package.json                       # Project dependencies and scripts
└── vite.config                        # Vite configuration
```

## Getting Started

To get started with the Robo4Earth Programming Interface, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open the Application**:
    Open your web browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## How to Use the Interface

1.  **Select a Block Category**: Use the category buttons to browse through the available blocks, which are organized into categories such as "Control," "Movement," and "Sounds."
2.  **Build Your Program**: Drag blocks from the panel and drop them into the programming area. You can connect blocks, reorder them, and adjust their parameters.
3.  **Preview the Code**: Switch to the code view to see the generated command sequence in either JavaScript or Python.
4.  **Connect to the Robot**: Click the "Connect" button to pair the application with a nearby micro:bit device via Web Bluetooth.
5.  **Run Your Program**: Press the "Run" button to send the commands to the robot and watch your program come to life.
6.  **Stop and Clear**: Use the "Stop" and "Clear" buttons to halt the program execution or reset the programming area. Your work is saved in the session, so you can continue later.

## Building for Production

To create an optimized build for production, run the following command:

```bash
npm run build
```

The optimized files will be generated in the `dist/` directory and can be deployed to any static hosting service.

## Troubleshooting

-   **Bluetooth Connection Issues**: Ensure that you are accessing the site over HTTPS (or `localhost`) and that the micro:bit is advertising the Nordic UART service.
-   **Program Not Saving**: Verify that your browser has session storage enabled. The application will only restore your program if the data is saved in the current session.
-   **Missing Translations**: Check that the desired language is available in `src/locales/translations.js` and is correctly configured in `src/i18n.js`.

## License

This project is licensed under the same terms as the upstream Robo4Earth repository.