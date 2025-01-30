import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

/**
 * CodeView Component
 *
 * Displays a pseudo-code representation of the block-based program.
 * Supports both JavaScript and Python syntax with typewriter animation.
 *
 * @param {Object} props
 * @param {Array} props.blocks - Array of programming blocks
 * @param {function} props.onClose - Handler for closing the code view
 */
const CodeView = ({ blocks = [], onClose }) => {
  const { t } = useTranslation();
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [language, setLanguage] = useState('javascript');

  /**
   * Helper function to safely get values from block config
   */
  const getSafeValue = (block, property, defaultValue = "") => {
    return block[property] !== undefined ? block[property] : defaultValue;
  };

  /**
   * Helper function to get option label
   */
  const getOptionLabel = (block) => {
    if (block.options && block.options.length > 0) {
      const option = block.options.find(opt => opt.value === block.inputValue);
      return option ? option.label : block.inputValue;
    }
    return block.inputValue;
  };

  /**
   * Converts a block to JavaScript pseudo-code
   */
  const blockToJS = (block, indent = 0) => {
    const spacing = '  '.repeat(indent);
    const inputValue = getSafeValue(block, 'inputValue');
    const secondInputValue = getSafeValue(block, 'secondInputValue');

    switch (block.id) {
      case 'start':
        return `${spacing}// Initialize program
${spacing}let programRunning = true;
${spacing}
${spacing}async function startProgram() {
${spacing}  while (programRunning) { // Main program loop\n`;

      case 'end':
        return `${spacing}    programRunning = false; // Stop program loop
${spacing}    console.log("Program terminated");
${spacing}  } // End of main loop
${spacing}}

${spacing}// Start the program
${spacing}console.log("Initializing robot program...");
${spacing}startProgram();\n`;

      case 'forward':
        return `${spacing}    await robot.moveForward(${inputValue}); // Move forward for ${inputValue} seconds\n`;

      case 'backward':
        return `${spacing}    await robot.moveBackward(${inputValue}); // Move backward for ${inputValue} seconds\n`;

      case 'left':
        return `${spacing}    await robot.turnLeft(${inputValue}); // Turn left for ${inputValue} seconds\n`;

      case 'right':
        return `${spacing}    await robot.turnRight(${inputValue}); // Turn right for ${inputValue} seconds\n`;

      case 'turn-left':
        return `${spacing}    await robot.turnLeftInPlace(${inputValue}); // Turn left in place for ${inputValue} seconds\n`;

      case 'turn-right':
        return `${spacing}    await robot.turnRightInPlace(${inputValue}); // Turn right in place for ${inputValue} seconds\n`;

      case 'wait':
        return `${spacing}    await delay(${inputValue}); // Wait for ${inputValue} seconds\n`;

      case 'leds-off':
        return `${spacing}    await robot.turnOffDisplay(); // Turn off LED display\n`;

      case block.id.match(/^show-picture_\d+/)?.input:
        const picLabel = getOptionLabel(block);
        return `${spacing}    await robot.showPicture("${picLabel}", ${secondInputValue}); // Show ${picLabel} for ${secondInputValue} seconds\n`;

      case 'repeat':
        let repeatCode = `${spacing}    // Repeat ${inputValue} times\n`;
        repeatCode += `${spacing}    for (let i = 0; i < ${inputValue}; i++) {\n`;
        if (block.childBlocks) {
          block.childBlocks.forEach(childBlock => {
            repeatCode += blockToJS(childBlock, indent + 2);
          });
        }
        repeatCode += `${spacing}    }\n`;
        return repeatCode;

      case 'dance':
        return `${spacing}    await robot.dance(${inputValue}, "${secondInputValue}"); // Dance ${inputValue} times with ${secondInputValue} intensity\n`;

      case 'zigzag':
        return `${spacing}    await robot.zigzag(${inputValue}, "${secondInputValue}"); // Zigzag ${inputValue} times with ${secondInputValue} intensity\n`;

      case 'shake':
        return `${spacing}    await robot.shake(${inputValue}, "${secondInputValue}"); // Shake ${inputValue} times with ${secondInputValue} intensity\n`;

      case 'pirouette':
        return `${spacing}    await robot.pirouette(${inputValue}); // Pirouette ${inputValue} times\n`;

      case block.id.match(/^melody_\d+/)?.input:
        const melodyLabel = getOptionLabel(block);
        return `${spacing}    await robot.playMelody("${melodyLabel}"); // Play melody: ${melodyLabel}\n`;

      case block.id.match(/^sound_\d+/)?.input:
        const soundLabel = getOptionLabel(block);
        return `${spacing}    await robot.playSound("${soundLabel}"); // Play sound: ${soundLabel}\n`;

      default:
        return `${spacing}    // Unknown block: ${block.id}\n`;
    }
  };

  /**
   * Converts a block to Python pseudo-code
   */
  const blockToPython = (block, indent = 0) => {
    const spacing = '  '.repeat(indent);
    const inputValue = getSafeValue(block, 'inputValue');
    const secondInputValue = getSafeValue(block, 'secondInputValue');

    switch (block.id) {
      case 'start':
        return `${spacing}# Initialize program
${spacing}import asyncio
${spacing}from robot_control import Robot
${spacing}
${spacing}program_running = True
${spacing}robot = Robot()
${spacing}
${spacing}async def start_program():
${spacing}    global program_running
${spacing}    while program_running:  # Main program loop\n`;

      case 'end':
        return `${spacing}        program_running = False  # Stop program loop
${spacing}        print("Program terminated")
${spacing}    # End of main loop
${spacing}
${spacing}# Start the program
${spacing}print("Initializing robot program...")
${spacing}asyncio.run(start_program())\n`;

      case 'forward':
        return `${spacing}        await robot.move_forward(${inputValue})  # Move forward for ${inputValue} seconds\n`;

      case 'backward':
        return `${spacing}        await robot.move_backward(${inputValue})  # Move backward for ${inputValue} seconds\n`;

      case 'left':
        return `${spacing}        await robot.turn_left(${inputValue})  # Turn left for ${inputValue} seconds\n`;

      case 'right':
        return `${spacing}        await robot.turn_right(${inputValue})  # Turn right for ${inputValue} seconds\n`;

      case 'turn-left':
        return `${spacing}        await robot.turn_left_in_place(${inputValue})  # Turn left in place for ${inputValue} seconds\n`;

      case 'turn-right':
        return `${spacing}        await robot.turn_right_in_place(${inputValue})  # Turn right in place for ${inputValue} seconds\n`;

      case 'wait':
        return `${spacing}        await asyncio.sleep(${inputValue})  # Wait for ${inputValue} seconds\n`;

      case 'leds-off':
        return `${spacing}        await robot.turn_off_display()  # Turn off LED display\n`;

      case block.id.match(/^show-picture_\d+/)?.input:
        const picLabel = getOptionLabel(block);
        return `${spacing}        await robot.show_picture("${picLabel}", ${secondInputValue})  # Show ${picLabel} for ${secondInputValue} seconds\n`;

      case 'repeat':
        let repeatCode = `${spacing}        # Repeat ${inputValue} times\n`;
        repeatCode += `${spacing}        for _ in range(${inputValue}):\n`;
        if (block.childBlocks) {
          block.childBlocks.forEach(childBlock => {
            repeatCode += blockToPython(childBlock, indent + 2);
          });
        }
        return repeatCode;

      case 'dance':
        return `${spacing}        await robot.dance(${inputValue}, "${secondInputValue}")  # Dance ${inputValue} times with ${secondInputValue} intensity\n`;

      case 'zigzag':
        return `${spacing}        await robot.zigzag(${inputValue}, "${secondInputValue}")  # Zigzag ${inputValue} times with ${secondInputValue} intensity\n`;

      case 'shake':
        return `${spacing}        await robot.shake(${inputValue}, "${secondInputValue}")  # Shake ${inputValue} times with ${secondInputValue} intensity\n`;

      case 'pirouette':
        return `${spacing}        await robot.pirouette(${inputValue})  # Pirouette ${inputValue} times\n`;

      case block.id.match(/^melody_\d+/)?.input:
        const melodyLabel = getOptionLabel(block);
        return `${spacing}        await robot.play_melody("${melodyLabel}")  # Play melody: ${melodyLabel}\n`;

      case block.id.match(/^sound_\d+/)?.input:
        const soundLabel = getOptionLabel(block);
        return `${spacing}        await robot.play_sound("${soundLabel}")  # Play sound: ${soundLabel}\n`;

      default:
        return `${spacing}        # Unknown block: ${block.id}\n`;
    }
  };

  /**
   * Generates complete program code from all blocks
   */
  const generateFullCode = () => {
    let code = '// =================================\n';
    code += '// ROBOT CONTROL PROGRAM v1.0\n';
    code += '// =================================\n\n';

    code += blocks.map(block =>
      language === 'javascript' ? blockToJS(block) : blockToPython(block)
    ).join('');

    return code;
  };

  // Reset animation when language changes
  useEffect(() => {
    setIsTyping(true);
    setDisplayedCode('');
  }, [language]);

  // Typewriter effect animation
  useEffect(() => {
    const fullCode = generateFullCode();
    let currentIndex = 0;

    if (!isTyping) return;

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullCode.length) {
        setDisplayedCode(fullCode.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 20); // Typing speed (ms per character)

    return () => clearInterval(typingInterval);
  }, [blocks, isTyping, language]);

  // Retro style for code display
  const codeStyle = {
    fontFamily: "'Courier New', monospace",
    backgroundColor: '#000',
    color: '#00ff00',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 255, 0, 0.2)',
    border: '1px solid #00ff00',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.4',
    textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
    minHeight: '300px'
  };

  // Cursor style
  const cursorStyle = {
    borderRight: isTyping ? '2px solid #00ff00' : 'none',
    animation: isTyping ? 'blink 1s step-end infinite' : 'none',
    paddingRight: '2px'
  };

  // Button style
  const buttonStyle = {
    backgroundColor: 'transparent',
    color: '#00ff00',
    border: '1px solid #00ff00',
    padding: '5px 15px',
    margin: '0 5px',
    borderRadius: '4px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
    textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
    transition: 'all 0.3s ease'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#00ff00',
    color: '#000'
  };

  return (
    <div className="bg-black rounded-lg shadow-lg p-6 max-w-4xl w-full border border-green-500">
      <div className="flex justify-between items-center mb-4 text-green-500">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-mono font-bold color-green-500">
            {language === 'javascript' ? 'ROBOT.JS' : 'ROBOT.PY'} - Code View
          </h2>
          <div className="flex gap-2">
            <button
              style={language === 'javascript' ? activeButtonStyle : buttonStyle}
              onClick={() => setLanguage('javascript')}
            >
              JavaScript
            </button>
            <button
              style={language === 'python' ? activeButtonStyle : buttonStyle}
              onClick={() => setLanguage('python')}
            >
              Python
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-green-900 rounded-full text-green-500"
          style={{ border: '1px solid #00ff00' }}
        >
          <X size={24} />
        </button>
      </div>
      <style>
        {`
          @keyframes blink {
            0%, 100% { border-color: transparent }
            50% { border-color: #00ff00 }
          }
        `}
      </style>
      <pre style={codeStyle}>
        <code className="text-sm">
          <span style={cursorStyle}>{displayedCode}</span>
        </code>
      </pre>
    </div>
  );
};

export const CodeViewPopUp = ({ toggleView, blocks }) => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <CodeView
      blocks={blocks}
      onClose={toggleView}
    />
  </div>
);
