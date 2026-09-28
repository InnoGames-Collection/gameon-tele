import React from 'react';
import { GameOnTeleLogo, GameOnTeleLogoProps } from './GameOnTeleLogo';

export type GoPlayLogoProps = GameOnTeleLogoProps;

export const GoPlayLogo: React.FC<GoPlayLogoProps> = (props) => {
  return <GameOnTeleLogo {...props} />;
};
