import {
  PhillipsDrive,
  FlatDrive,
  HexDrive,
  RobinsonDrive,
  TorxDrive,
} from '../images/drivers';

import {
  FlatHead,
  HexHead,
  PanHead,
  RoundHead,
} from '../images/heads';

import {
  StandardNut,
  LockNut,
  CapNut,
} from '../images/nuts';

import {
  FenderWasher,
  FlatWasher,
  SplitWasher,
  StarExteriorWasher,
  StarInteriorWasher,
} from '../images/washers';

export const driveIcons = {
  Phillips: PhillipsDrive,
  Slotted: FlatDrive,
  Hex: HexDrive,
  Square: RobinsonDrive,
  Torx: TorxDrive,
};

export const headIcons = {
  Flat: FlatHead,
  Hex: HexHead,
  Pan: PanHead,
  Round: RoundHead,
};

export const nutIcons = {
  Standard: StandardNut,
  Lock: LockNut,
  Cap: CapNut,
};

export const washerIcons = {
  'Flat': FlatWasher,
  'Fender': FenderWasher,
  'Split': SplitWasher,
  'Star Exterior': StarExteriorWasher,
  'Star Interior': StarInteriorWasher,
};

export const generateAutofillText = (icon) => {
  switch (icon.type) {
    case 'Screws':
      return [`${icon.size}×${icon.length}`, `${icon.head} ${icon.drive}`];
    case 'Nuts':
      return [`${icon.size}`, `${icon.nutType}`];
    case 'Washers':
      return [`${icon.size}`, `${icon.washerType}`];
    default:
      return ['', ''];
  }
}; 