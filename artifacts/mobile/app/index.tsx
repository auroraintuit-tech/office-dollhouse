import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useGame } from '@/contexts/GameContext';

export default function Index() {
  const { state, isLoaded } = useGame();

  useEffect(() => {
    if (!isLoaded) return;
    switch (state.phase) {
      case 'register':
        router.replace('/onboarding/register');
        break;
      case 'company':
        router.replace('/onboarding/company');
        break;
      case 'avatar':
        router.replace('/onboarding/avatar');
        break;
      case 'style':
        router.replace('/onboarding/style');
        break;
      case 'entrance':
        router.replace('/game/entrance');
        break;
      case 'office':
        router.replace('/game/office');
        break;
    }
  }, [isLoaded, state.phase]);

  return (
    <View style={{ flex: 1, backgroundColor: '#1A0D06', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#C67C12" size="large" />
    </View>
  );
}
