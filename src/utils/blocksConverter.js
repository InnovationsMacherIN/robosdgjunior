// blocksConverter.js
// Converts programming blocks to micro:bit commands based on R4Gblocks.js functionality

const DELIMITER = ':';
const FLOAT_DELIMITER = '.0:';
const FULL_VELOCITY = 'Gb15';

// Motor velocity state (käytetään pirouette ja muissa toiminnoissa)
let motorVelocity = {
  1: '15',
  2: '15'
};

// Movement combinations from R4Gblocks.js
const COMBINATIONS = [
  ['Bv0.3','W0.1','Bz0.3','W0.1','BL0.3','W0.1','BR0.6','W0.1','BL0.6',
    'W0.1','BR0.6','W0.1','BL0.6','W0.1','BR0.3'], // dance
  ['BL0.1','W0.1','Bv0.3','W0.1','BR0.2','W0.1','Bv0.3','W0.1','BL0.2'], // zigzag
  ['BL0.1','BR0.2','BL0.2','BR0.2','BL0.1'] // shake
];

/**
 * Converts a sequence of programming blocks to micro:bit commands
 */
const convertBlocksToCommands = (blocks) => {
  console.log('Converting blocks to commands:', blocks);
  let commands = '';

  // Start with full velocity
  //commands += FULL_VELOCITY + DELIMITER;

  blocks.forEach(block => {
    switch(block.id) {
      // Display 'A'
      case 'show-text':
        // Tarkistetaan että teksti on olemassa ennen sen lähettämistä
        if (block.inputValue) {
          commands += `${block.inputValue}${DELIMITER}`;
        }
        break;

      case 'show-picture':
        if (block.inputValue && block.secondInputValue) {
          commands += `A${block.inputValue}${block.secondInputValue}${DELIMITER}`;
        }
        break;

      case 'leds-off':
        commands += `A00${DELIMITER}`;
        break;

      // Movements 'B'
      case 'forward':
        const fwdDuration = parseFloat(block.inputValue);
        if (!isNaN(fwdDuration)) {
          commands += `Bv${fwdDuration}${fwdDuration % 1 === 0 ? '.0' : ''}${DELIMITER}`;
        }
        break;

      case 'backward':
        const bwdDuration = parseFloat(block.inputValue);
        if (!isNaN(bwdDuration)) {
          commands += `Bz${bwdDuration}${bwdDuration % 1 === 0 ? '.0' : ''}${DELIMITER}`;
        }
        break;

      case 'left':
        const leftDuration = parseFloat(block.inputValue);
        if (!isNaN(leftDuration)) {
          commands += `Bl${leftDuration}${leftDuration % 1 === 0 ? '.0' : ''}${DELIMITER}`;
        }
        break;

      case 'right':
        const rightDuration = parseFloat(block.inputValue);
        if (!isNaN(rightDuration)) {
          commands += `Br${rightDuration}${rightDuration % 1 === 0 ? '.0' : ''}${DELIMITER}`;
        }
        break;

      case 'turn-left':
        const turnLeftDuration = parseFloat(block.inputValue);
        if (!isNaN(turnLeftDuration)) {
          commands += `BL${turnLeftDuration}${turnLeftDuration % 1 === 0 ? '.0' : ''}${DELIMITER}`;
        }
        break;

      case 'turn-right':
        const turnRightDuration = parseFloat(block.inputValue);
        if (!isNaN(turnRightDuration)) {
          commands += `BR${turnRightDuration}${turnRightDuration % 1 === 0 ? '.0' : ''}${DELIMITER}`;
        }
        break;

      // Combinations 'K'
      case 'dance':
        commands += getCombinationCommands('dance', block.inputValue, block.secondInputValue);
        break;

      case 'zigzag':
        commands += getCombinationCommands('zigzag', block.inputValue, block.secondInputValue);
        break;

      case 'shake':
        commands += getCombinationCommands('shake', block.inputValue, block.secondInputValue);
        break;

      case 'pirouette':
        commands += handlePirouette(block.inputValue);
        break;

      // Melody/Sounds
      case 'melody':
        if (block.inputValue) {
          commands += `${block.inputValue}${DELIMITER}`;
        }
        break;

      case 'sound':
        if (block.inputValue) {
          commands += `${block.inputValue}${DELIMITER}`;
        }
        break;

      // Settings
      case 'motor':
        if (block.inputValue && block.secondInputValue) {
          const speed = parseInt(block.secondInputValue);
          const formattedSpeed = speed < 10 ? `0${speed}` : speed;
          commands += `G${block.inputValue}${formattedSpeed}${DELIMITER}`;
          if (block.inputValue === 'b') {
            motorVelocity['1'] = formattedSpeed;
            motorVelocity['2'] = formattedSpeed;
          } else {
            motorVelocity[block.inputValue] = formattedSpeed;
          }
        }
        break;

      // Program Control
      case 'wait':
        const waitDuration = parseFloat(block.inputValue);
        if (!isNaN(waitDuration)) {
          commands += `W${waitDuration}${waitDuration % 1 === 0 ? '.0' : ''}${DELIMITER}`;
        }
        break;

      case 'start':
        // Ei tarvitse tuottaa komentoa
        break;
    }
  });

  // Poistetaan viimeinen kaksoispiste jos se on olemassa
  //if (commands.endsWith(DELIMITER)) {
  //  commands = commands.slice(0, -1);
  //}

  return commands;
};

/**
 * Creates commands for movement combinations (dance, zigzag, shake)
 */
const getCombinationCommands = (type, repetitions, intensity) => {
  let commands = '';

  // Set speed based on intensity
  if (intensity === 'middle') {
    commands = 'Gb14' + DELIMITER;
  } else if (intensity === 'strong') {
    commands = 'Gb21' + DELIMITER;
  } else {
    commands = 'Gb10' + DELIMITER;
  }

  // Add combination commands based on type
  const combinationIndex = type === 'dance' ? 0 : type === 'zigzag' ? 1 : 2;
  for (let i = 0; i < repetitions; i++) {
    COMBINATIONS[combinationIndex].forEach(cmd => {
      commands += cmd + DELIMITER;
    });
  }

  // Reset motor speeds
  commands += `G1${motorVelocity['1']}${DELIMITER}`;
  commands += `G2${motorVelocity['2']}${DELIMITER}`;

  return commands;
};

/**
 * Handle pirouette command from R4Gblocks.js
 */
const handlePirouette = (repetitions) => {
  const turns = repetitions * 1.5;
  const duration = turns + (turns % 1 === 0 ? '.0' : '');
  let commands = `Gb20${DELIMITER}BL${duration}${DELIMITER}W0.1${DELIMITER}BR${duration}${DELIMITER}`;

  // Reset motor speeds
  commands += `G1${motorVelocity['1']}${DELIMITER}`;
  commands += `G2${motorVelocity['2']}${DELIMITER}`;

  return commands;
};

export { convertBlocksToCommands };
