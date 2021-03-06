import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

import { GilroySmallText, RecoletaLargeText } from '../../common/typography.styles';
import { IPlant } from '../../apiTypes/Plant';

import {
  Container,
  Image,
  Cell,
  SoilPh,
  SoilPhContainer,
  Season,
  SeasonContainer,
  HarvestContainer,
} from './Row.styles';
import exposureToIcon from './utils/SunExposureIcon';
import { TColumn } from './utils/constants';
import cancel from './assets/cancel.png';
import add from './assets/add.png';

function Row({ plant, columns }: { plant: IPlant; columns: { key: string; display: string; leftPos?: number }[] }) {
  const user = localStorage.getItem('user') || '';
  const userEmail = JSON.parse(user).email;

  const { name, id, users } = plant;

  const initSelected = !!users.find((user) => user.email === userEmail);
  const [isSelected, setIsSelected] = useState(initSelected);

  const SELECT_PLANT = gql`
    mutation AddPlantToUser($email: String!, $plantId: Int!) {
      AddPlantToUser(email: $email, plantId: $plantId) {
        plantId
      }
    }
  `;
  const DESELECT_PLANT = gql`
    mutation DeletePlantToUser($email: String!, $plantId: Int!) {
      DeletePlantToUser(email: $email, plantId: $plantId) {
        id
        plantId
        userId
      }
    }
  `;

  const [selectPlant] = useMutation(SELECT_PLANT, {
    variables: {
      plantId: id,
      email: userEmail,
    },
  });
  const [deselectPlant] = useMutation(DESELECT_PLANT, {
    variables: {
      plantId: id,
      email: userEmail,
    },
  });

  const handleOnClick = async () => {
    if (isSelected) {
      await deselectPlant();
      setIsSelected(false);
    } else {
      await selectPlant();
      setIsSelected(true);
    }
  };

  const makeReactKey = (col: string, key?: string) => `${name}_${id}_${col}_${key}`;
  const exposure = plant.sunExposure?.join('_');

  const sunExposure = <img src={exposureToIcon(exposure)} />;

  const soilPh = (
    <SoilPhContainer>
      {plant.soilPh.map((ph) => (
        <SoilPh ph={ph} key={`soilPh_${ph}`} />
      ))}
    </SoilPhContainer>
  );

  const bloomSeason = (
    <SeasonContainer key={makeReactKey('bloomSeason', 'parent')}>
      {plant.bloomSeason.map((season) => (
        <Season season={season} key={`bloomSeason_${season}`}>
          <GilroySmallText>{season}</GilroySmallText>
        </Season>
      ))}
    </SeasonContainer>
  );

  const getCell = (col: TColumn) => {
    switch (col.key) {
      case 'src':
        return <Image src={isSelected ? cancel : add} />;
      case 'name':
        return <RecoletaLargeText>{plant.name}</RecoletaLargeText>;
      case 'sunExposure':
        return sunExposure;
      case 'soilPh':
        return soilPh;
      case 'bloomSeason':
        return bloomSeason;
      case 'daysToMaturity':
        return (
          <HarvestContainer>
            {plant.daysToMaturity}
            <GilroySmallText>days</GilroySmallText>
          </HarvestContainer>
        );
      default:
        return <GilroySmallText>{plant[col.key]}</GilroySmallText>;
    }
  };

  return (
    <Container onClick={handleOnClick}>
      {columns.map((column) => (
        <Cell leftPos={column.leftPos} key={makeReactKey(column.key, plant[column.key])}>
          {getCell(column)}
        </Cell>
      ))}
    </Container>
  );
}

export default Row;
