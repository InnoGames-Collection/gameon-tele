import React from 'react';
import { GameOnTeleLogo, GameOnTeleLogoProps } from './GameOnTeleLogo';

export type TelePlusLogoProps = GameOnTeleLogoProps;

export const TelePlusLogo: React.FC<TelePlusLogoProps> = (props) => {
  return <GameOnTeleLogo {...props} />;
};
