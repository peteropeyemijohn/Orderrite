import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { en } from 'shared';
import { ApiStatus } from '@/components/ApiStatus';

export default function HelloScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>{en.hello.title}</Text>
        <Text style={styles.subtitle}>{en.hello.subtitle}</Text>
        <ApiStatus />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#171717', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#525252', textAlign: 'center' },
});
