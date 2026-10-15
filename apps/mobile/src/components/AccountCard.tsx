import { StyleSheet, View } from 'react-native';
import { en, type AuthUser } from 'shared';
import { plain } from '@/theme/plain';
import { Body } from './ui';

/** Shows who is signed in (placeholder home screens). */
export function AccountCard({ user }: { user: AuthUser }) {
  return (
    <View style={styles.card}>
      <Body>
        {en.home.signedInAs}: {user.name ?? user.phone}
      </Body>
      <Body>
        {en.home.phone}: {user.phone}
      </Body>
      <Body>
        {en.home.role}: {user.role}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: plain.color.border, borderRadius: plain.radius, padding: plain.space.md, gap: plain.space.xs },
});
