export const categories = ['Control', 'LED Display', 'Movement', 'Sounds'];
// export const categories = ['Steering', 'LED Display', 'Movements', 'Combinations', 'Sounds', 'Settings']; ORIGINAL

// ProgrammingInterface.jsx
// ProgrammingInterface.jsx blocksByCategory päivitys

export const blocksByCategory = {
  'Control': [
    {
      id: 'start',
      title: 'Kun Start painettu',
      description: 'Ohjelman tulee alkaa tällä lohkolla',
      className: 'block-steering block-start', // lisätty start-luokka, jotta voidaan tehdä spesifi CSS-muotoilu
      action: 'START',
      command: 'start:'
    },
    {
      id: 'repeat',
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
      id: 'end',
      title: 'Loppu',
      description: 'Ohjelman tulee päättyä tähän lohkoon',
      className: 'block-steering block-end', // lisätty end-luokka, jotta voidaan tehdä spesifi CSS-muotoilu
      action: 'END',
      command: 'end:'
    },
    {
      id: 'wait',
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
    }
  ],
  'LED Display': [
    {
      id: 'show-text',
      title: 'Kirjoita',
      description: 'Näytä teksti LED-näytöllä (max 8 merkkiä)',
      className: 'block-display',
      action: 'SHOW_TEXT',
      hasInput: true,
      inputType: 'text',
      inputLabel: 'Teksti',
      maxLength: 8,
      command: (text) => `${text}:`
    },
    {
      id: 'show-picture',
      title: 'Näytä kuva',
      description: 'Näytä valittu kuva LED-näytöllä',
      className: 'block-display',
      action: 'SHOW_PICTURE',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Kuva',
      options: [
        { value: '01', label: 'Fröhlich' },
        { value: '02', label: 'Herz' },
        { value: '03', label: 'Herz klein' },
        { value: '04', label: 'Traurig' },
        { value: '05', label: 'Böse' },
        { value: '06', label: 'Müde' },
        { value: '07', label: 'Überrascht' },
        { value: '08', label: 'Richtig' },
        { value: '09', label: 'Falsch' },
        { value: '10', label: 'Zwinkern' },
        { value: '11', label: 'Alien' },
        { value: '12', label: 'Pfeil nach links' },
        { value: '13', label: 'Pfeil nach rechts' }
      ],
      hasSecondInput: true,
      secondInputType: 'number',
      secondInputLabel: 'Sekunnit',
      secondInputMin: 1,
      secondInputMax: 9,
      command: (picId, duration) => `A${picId}${duration}:`
    },
    {
      id: 'leds-off',
      title: 'Sammuta näyttö',
      description: 'Sammuttaa LED-näytön',
      className: 'block-display',
      action: 'LEDS_OFF',
      command: 'A00:'
    }
  ],
  'Movement': [
    {
      id: 'forward',
      title: 'Eteenpäin',
      description: 'Liiku eteenpäin',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bv${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      id: 'backward',
      title: 'Taaksepäin',
      description: 'Liiku taaksepäin',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bz${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      id: 'left',
      title: 'Vasemmalle',
      description: 'Käänny vasemmalle',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Bl${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      id: 'right',
      title: 'Oikealle',
      description: 'Käänny oikealle',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `Br${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      id: 'turn-left',
      title: 'Käänny paikallaan vasemmalle',
      description: 'Käänny vasemmalle paikallasi',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `BL${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      id: 'turn-right',
      title: 'Käänny paikallaan oikealle',
      description: 'Käänny oikealle paikallasi',
      className: 'block-movement',
      hasInput: true,
      inputType: 'number',
      inputLabel: 'Sekunnit',
      inputMin: 0.1,
      inputMax: 9.9,
      inputStep: 0.1,
      defaultValue: 1,
      command: (duration) => `BR${duration}${duration % 1 === 0 ? '.0:' : ':'}`
    },
    {
      id: 'dance',
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
      id: 'zigzag',
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
      id: 'shake',
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
      id: 'pirouette',
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
      id: 'dance',
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
      id: 'zigzag',
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
      id: 'shake',
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
      id: 'pirouette',
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
      id: 'melody',
      title: 'Soita melodia',
      description: 'Soita valittu melodia',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Melodia',
      options: [
        { value: 'M01', label: 'Tusch' },
        { value: 'M02', label: 'Romantisch' },
        { value: 'M03', label: 'Star Wars' },
        { value: 'M04', label: 'Super Mario' },
        { value: 'M05', label: 'Donauwalzer' },
        { value: 'M06', label: 'Tango Kriminalis' },
        { value: 'M07', label: "Don't Worry be Happy" },
        { value: 'M08', label: 'Somewhere over the Rainbow' },
        { value: 'M09', label: 'Harry Potter' },
        { value: 'M10', label: 'Happy Birthday' }
      ],
      command: (melodyId) => `${melodyId}:`
    },
    {
      id: 'sound',
      title: 'Soita ääni',
      description: 'Soita valittu ääni (vain micro:bit V2)',
      className: 'block-sound',
      hasInput: true,
      inputType: 'select',
      inputLabel: 'Ääni',
      options: [
        { value: 'K01', label: 'Kichern' },
        { value: 'K02', label: 'Fröhlich' },
        { value: 'K03', label: 'Hallo' },
        { value: 'K04', label: 'Mysteriös' },
        { value: 'K05', label: 'Traurig' },
        { value: 'K06', label: 'Rutschen' },
        { value: 'K07', label: 'Aufsteigen' },
        { value: 'K08', label: 'Federn' },
        { value: 'K09', label: 'Funkeln' },
        { value: 'K10', label: 'Gähnen' }
      ],
      command: (soundId) => `${soundId}:`
    }
  ],
  /*
  'Settings': [
    {
      id: 'motor',
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
