import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import ExteriorScene from '@/components/ExteriorScene';

export default function EntranceScreen() {
  const { state, initOffice } = useGame();

  function handleEntered() {
    initOffice();
    router.replace('/game/office');
  }

  if (!state.player || !state.company) {
    router.replace('/');
    return null;
  }

  return (
    <View style={styles.container}>
      <ExteriorScene
        companyName={state.company.name}
        logoUri={state.company.logoUri}
        avatarId={state.player.avatarId}
        officeStyle={state.officeStyle}
        onEntered={handleEntered}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090F',
  },
});
