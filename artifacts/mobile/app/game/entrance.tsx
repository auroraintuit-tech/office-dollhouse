import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import ExteriorScene from '@/components/ExteriorScene';

export default function EntranceScreen() {
  const { state, isLoaded, initOffice } = useGame();

  // Safety redirect — must be in useEffect, never during render
  useEffect(() => {
    if (!isLoaded) return;
    if (!state.player || !state.company) {
      router.replace('/');
    }
  }, [isLoaded, state.player, state.company]);

  function handleEntered() {
    initOffice();
    router.replace('/game/office');
  }

  if (!state.player || !state.company) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <ExteriorScene
        companyName={state.company.name}
        logoUri={state.company.logoUri}
        avatarId={state.player.avatarId}
        photoUri={state.player.photoUri}
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
