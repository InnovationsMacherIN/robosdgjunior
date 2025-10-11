/**
 * @file blocksConfig.js
 * @description This file contains the configuration for all the programming blocks available in the application.
 * @module config/blocksConfig
 */
export const categories = ['Control', 'LED Display', 'Movement', 'Sounds'];

export const blocksByCategory = {
  'Control': [
    {
      type: 'start',
      title: 'When Start is pressed',
      description: 'The program must start with this block',
      className: 'block-steering block-start',
      action: 'START',
      command: 'start:'
    },
    {
      type: 'wait',
      title: 'Wait',
      description: 'Wait for a specified time',
      className: 'block-settings',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `W${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'end',
      title: 'End',
      description: 'The program must end with this block',
      className: 'block-steering block-end',
      action: 'END',
      command: 'end:'
    }
  ],
  'LED Display': [
    {
      type: 'show-picture_1',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '01', label: 'Happy' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_2',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '02', label: 'Heart' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_4',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '04', label: 'Sad' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_8',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '08', label: 'Correct' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_9',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '09', label: 'Incorrect' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_10',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '10', label: 'Wink' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_12',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '12', label: 'Arrow left' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_13',
      title: 'Show picture',
      description: 'Show the selected picture on the LED display',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '13', label: 'Arrow right' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'leds-off',
      title: 'Turn off display',
      description: 'Turns off the LED display',
      className: 'block-display',
      action: 'LEDS_OFF',
      command: 'A00:'
    }
  ],
  'Movement': [
    {
      type: 'forward',
      title: 'Forward',
      description: 'Move forward',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bv${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'backward',
      title: 'Backward',
      description: 'Move backward',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bz${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'left',
      title: 'Left',
      description: 'Turn left',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bl${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'right',
      title: 'Right',
      description: 'Turn right',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Br${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'turn-left',
      title: 'Turn left in place',
      description: 'Turn left in place',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `BL${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'turn-right',
      title: 'Turn right in place',
      description: 'Turn right in place',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Seconds',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `BR${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'dance',
      title: 'Dance',
      description: 'Perform a dance move',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Repetitions',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Intensity',
      options: [
        { value: 'easy', label: 'Light' },
        { value: 'middle', label: 'Medium' },
        { value: 'strong', label: 'Strong' }
      ],
      command: 'DANCE'
    },
    {
      type: 'zigzag',
      title: 'Zigzag',
      description: 'Move in a zigzag pattern',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Repetitions',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Intensity',
      options: [
        { value: 'easy', label: 'Light' },
        { value: 'middle', label: 'Medium' },
        { value: 'strong', label: 'Strong' }
      ],
      command: 'ZIGZAG'
    },
    {
      type: 'shake',
      title: 'Shake',
      description: 'Shake the robot',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Repetitions',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Intensity',
      options: [
        { value: 'easy', label: 'Light' },
        { value: 'middle', label: 'Medium' },
        { value: 'strong', label: 'Strong' }
      ],
      command: 'SHAKE'
    },
    {
      type: 'pirouette',
      title: 'Pirouette',
      description: 'Spin around',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Repetitions',
      inputMin: 1,
      inputMax: 5,
      defaultValue: 1,
      command: 'PIROUETTE'
    }
  ],
  'Sounds': [
    {
      type: 'melody_1',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_Tusch',
      options: [
        { value: 'M01', label: 'Tusch' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_2',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_Romantic',
      options: [
        { value: 'M02', label: 'Romantic' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_3',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_Star_Wars',
      options: [
        { value: 'M03', label: 'Star Wars' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_4',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_Super_Mario',
      options: [
        { value: 'M04', label: 'Super Mario' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_7',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_happy',
      options: [
        { value: 'M07', label: "Don't Worry be Happy" }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_8',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_rainbow',
      options: [
        { value: 'M08', label: 'Somewhere over the Rainbow' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_9',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_H_P',
      options: [
        { value: 'M09', label: 'Harry Potter' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_10',
      title: 'Play melody',
      description: 'Play the selected melody',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_H_B',
      options: [
        { value: 'M10', label: 'Happy Birthday' }
      ],
      command: (melodyId) => `${melodyId}:`
    }
  ]
};