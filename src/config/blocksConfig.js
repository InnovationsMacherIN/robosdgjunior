export const categories = ['Control', 'LED Display', 'Movement', 'Sounds'];
// export const categories = ['Steering', 'LED Display', 'Movements', 'Combinations', 'Sounds', 'Settings']; ORIGINAL

// ProgrammingInterface.jsx
// ProgrammingInterface.jsx blocksByCategory päivitys

export const blocksByCategory = {
  'Control': [
    {
      type: 'start',
      title: 'Kun Start painettu',
      description: 'Ohjelman tulee alkaa tällä lohkolla',
      className: 'block-steering block-start', // lisätty start-luokka, jotta voidaan tehdä spesifi CSS-muotoilu
      action: 'START',
      command: 'start:'
    },
    {
      type: 'repeat',
      title: 'Toista',
      description: 'Toista sisällä olevat lohkot määrätyn kerran',
      className: 'block-steering block-container', // lisätty container-luokka
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      isContainer: true, // merkitään että tämä voi sisältää muita lohkoja
      childBlocks: [], // taulukko sisällä oleville lohkoille
      command: (times, childCommands) => {
        // Toistaa sisällä olevien lohkojen komennot määrätyn kertaa
        let commands = '';
        for(let i = 0; i < times; i++) {
          commands += childCommands;
        }
        return commands;
      }
    },
    {
      type: 'wait',
      title: 'Odota',
      description: 'Odota määrätty aika',
      className: 'block-settings',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `W${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'end',
      title: 'Loppu',
      description: 'Ohjelman tulee päättyä tähän lohkoon',
      className: 'block-steering block-end', // lisätty end-luokka, jotta voidaan tehdä spesifi CSS-muotoilu
      action: 'END',
      command: 'end:'
    }
  ],
  'LED Display': [
    /*{
      type: 'show-text',
      title: 'Kirjoita',
      description: 'Näytä teksti LED-näytöllä (max 8 merkkiä)',
      className: 'block-display',
      action: 'SHOW_TEXT',
      hasInput: true,
      inputType: 'text',
      inputLabel: 'Teksti',
      maxLength: 8,
      command: (text) => `${text}:`
    },*/
    {
      type: 'show-picture_1',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '01', label: 'Fröhlich' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_2',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '02', label: 'Herz' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_3',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '03', label: 'Herz klein' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_4',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '04', label: 'Traurig' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_5',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '05', label: 'Böse' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_6',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '06', label: 'Müde' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_7',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '07', label: 'Überrascht' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_8',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '08', label: 'Richtig' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_9',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '09', label: 'Falsch' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_10',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '10', label: 'Zwinkern' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_11',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '11', label: 'Alien' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_12',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '12', label: 'Pfeil nach links' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'show-picture_13',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      options: [
        { value: '13', label: 'Pfeil nach rechts' }
      ],
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      type: 'leds-off',
      title: 'Sammuta näyttö',
      description: 'Sammuttaa LED-näytön',
      className: 'block-display',
      action: 'LEDS_OFF',
      command: 'A00:'
    }
  ],
  'Movement': [
    {
      type: 'forward',
      title: 'Eteenpäin',
      description: 'Liiku eteenpäin',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bv${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'backward',
      title: 'Taaksepäin',
      description: 'Liiku taaksepäin',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bz${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'left',
      title: 'Vasemmalle',
      description: 'Käänny vasemmalle',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bl${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'right',
      title: 'Oikealle',
      description: 'Käänny oikealle',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Br${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'turn-left',
      title: 'Käänny paikallaan vasemmalle',
      description: 'Käänny vasemmalle paikallasi',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `BL${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'turn-right',
      title: 'Käänny paikallaan oikealle',
      description: 'Käänny oikealle paikallasi',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.0,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `BR${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      type: 'dance',
      title: 'Tanssi',
      description: 'Suorita tanssiliike',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Voimakkuus',
      options: [
        { value: 'easy', label: 'Kevyt' },
        { value: 'middle', label: 'Keskitaso' },
        { value: 'strong', label: 'Voimakas' }
      ],
      command: 'DANCE'
    },
    {
      type: 'zigzag',
      title: 'Siksak',
      description: 'Liiku siksakilla',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Voimakkuus',
      options: [
        { value: 'easy', label: 'Kevyt' },
        { value: 'middle', label: 'Keskitaso' },
        { value: 'strong', label: 'Voimakas' }
      ],
      command: 'ZIGZAG'
    },
    {
      type: 'shake',
      title: 'Ravista',
      description: 'Ravistele robottia',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Voimakkuus',
      options: [
        { value: 'easy', label: 'Kevyt' },
        { value: 'middle', label: 'Keskitaso' },
        { value: 'strong', label: 'Voimakas' }
      ],
      command: 'SHAKE'
    },
    {
      type: 'pirouette',
      title: 'Piruetti',
      description: 'Pyörähdä ympäri',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 5,
      defaultValue: 1,
      command: 'PIROUETTE'
    }
  ],
  /*
  'Combinations': [
    {
      type: 'dance',
      title: 'Tanssi',
      description: 'Suorita tanssiliike',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Voimakkuus',
      options: [
        { value: 'easy', label: 'Kevyt' },
        { value: 'middle', label: 'Keskitaso' },
        { value: 'strong', label: 'Voimakas' }
      ],
      command: 'DANCE'
    },
    {
      type: 'zigzag',
      title: 'Siksak',
      description: 'Liiku siksakilla',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Voimakkuus',
      options: [
        { value: 'easy', label: 'Kevyt' },
        { value: 'middle', label: 'Keskitaso' },
        { value: 'strong', label: 'Voimakas' }
      ],
      command: 'ZIGZAG'
    },
    {
      type: 'shake',
      title: 'Ravista',
      description: 'Ravistele robottia',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 9,
      defaultValue: 1,
      hasSecondInput: true,
      secondInputType: 'select',
      secondInputLabel: 'Voimakkuus',
      options: [
        { value: 'easy', label: 'Kevyt' },
        { value: 'middle', label: 'Keskitaso' },
        { value: 'strong', label: 'Voimakas' }
      ],
      command: 'SHAKE'
    },
    {
      type: 'pirouette',
      title: 'Piruetti',
      description: 'Pyörähdä ympäri',
      className: 'block-combination',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Toistot',
      inputMin: 1,
      inputMax: 5,
      defaultValue: 1,
      command: 'PIROUETTE'
    }
  ],*/
  'Sounds': [
    {
      type: 'melody_1',
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
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
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_Romantisch',
      options: [
        { value: 'M02', label: 'Romantisch' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_3',
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_Star_wars',
      options: [
        { value: 'M03', label: 'Star Wars' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_4',
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
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
      type: 'melody_5',
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_Donauwalzer',
      options: [
        { value: 'M05', label: 'Donauwalzer' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_6',
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_tango',
      options: [
        { value: 'M06', label: 'Tango Kriminalis' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      type: 'melody_7',
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
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
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
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
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
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
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melody_H_B',
      options: [
        { value: 'M10', label: 'Happy Birthday' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    /*
    {
      type: 'sound_1',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Kichern',
      options: [
        { value: 'K01', label: 'Kichern' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_2',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Fröhlich',
      options: [
        { value: 'K02', label: 'Fröhlich' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_3',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Hallo',
      options: [
        { value: 'K03', label: 'Hallo' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_4',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Mysteriös',
      options: [
        { value: 'K04', label: 'Mysteriös' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_5',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Traurig',
      options: [
        { value: 'K05', label: 'Traurig' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_6',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Rutschen',
      options: [
        { value: 'K06', label: 'Rutschen' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_7',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Aufsteigen',
      options: [
        { value: 'K07', label: 'Aufsteigen' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_8',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Federn',
      options: [
        { value: 'K08', label: 'Federn' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_9',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Funkeln',
      options: [
        { value: 'K09', label: 'Funkeln' }
      ],
      command: (soundId) => `${soundId}:`
    },
    {
      type: 'sound_10',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Sound_Gähnen',
      options: [
        { value: 'K10', label: 'Gähnen' }
      ],
      command: (soundId) => `${soundId}:`
    }*/
  ],
  /*
  'Settings': [
    {
      type: 'motor',
      title: 'Moottorin nopeus',
      description: 'Säädä moottorin nopeutta',
      className: 'block-settings',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Moottori',
      options: [
        { value: '2', label: 'Vasen' },
        { value: '1', label: 'Oikea' },
        { value: 'b', label: 'Molemmat' }
      ],
      hasSecondInput: true,
      secondInputType: 'number',
      secondInputLabel: 'Nopeus',
      secondInputMin: 1,
      secondInputMax: 31,
      defaultValue: 20,
      command: (motor, speed) => `G${motor}${speed < 10 ? '0' + speed : speed}:`
    },
  ]*/
};
