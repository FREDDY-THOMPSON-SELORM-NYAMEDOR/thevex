import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { getJson, postJson } from '../services/api';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80' };

export default function BrowseGroupsScreen({ navigation, route }) {
  const [groups, setGroups] = useState([]);
  const [activity, setActivity] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  async function loadGroups() {
    try {
      const result = await getJson(`/browseGroups?userId=${currentUser?.id}`);
      setGroups(result.groups || []);
    } catch (error) {
      setActivity((prev) => [`Failed to load groups: ${error.message}`, ...prev].slice(0, 4));
    }
  }

  useEffect(() => {
    async function loadUser() {
      const user = await getStoredUser();
      setCurrentUser(user);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }
    loadGroups();
    const cleanup1 = onSocket('groupCreated', ({ group }) => {
      setGroups((prev) => [group, ...prev]);
      setActivity((prev) => [`New group created: ${group.origin} → ${group.location}`, ...prev].slice(0, 4));
    });
    const cleanup2 = onSocket('groupJoined', ({ groupId, group }) => {
      if (group) {
        setGroups((prev) => prev.map((entry) => (entry.id === groupId ? group : entry)));
      }
      setActivity((prev) => [`A rider joined group ${groupId}`, ...prev].slice(0, 4));
    });
    const cleanup4 = onSocket('groupMemberVerified', ({ groupId }) => {
      setActivity((prev) => [`Group member verified for group ${groupId}`, ...prev].slice(0, 4));
      loadGroups();
    });
    const cleanup3 = onSocket('groupRideBooked', ({ ride }) => {
      setActivity((prev) => [`Group ride booked: ${ride.car} in ${ride.eta}`, ...prev].slice(0, 4));
    });
    return () => { cleanup1(); cleanup2(); cleanup3(); cleanup4(); };
  }, [currentUser]);

  async function handleJoin(groupId) {
    try {
      const result = await postJson('/joinGroup', { groupId, userId: currentUser?.id });
      setGroups((prev) => prev.map((group) => (group.id === groupId ? result.group : group)));
      setActivity((prev) => [`Joined group ${groupId}. Pay GHS${result.paymentAmount} to move out of probation.`, ...prev].slice(0, 4));
    } catch (error) {
      setActivity((prev) => [`Join failed: ${error.message}`, ...prev].slice(0, 4));
    }
  }

  async function handlePay(group) {
    const member = group.members?.find((entry) => entry.userId === currentUser?.id);
    if (!member) {
      setActivity((prev) => [`No probation member record found for group ${group.id}`, ...prev].slice(0, 4));
      return;
    }

    navigation.navigate('Payment', {
      paymentType: 'group',
      groupId: group.id,
      groupMemberId: member.membershipId,
      amount: group.paymentAmount || 0,
      groupTitle: `${group.origin} → ${group.location}`
    });
  }

  async function handleBook(groupId) {
    try {
      const result = await postJson('/bookGroupRide', { groupId });
      setActivity((prev) => [`Ride booked for group ${groupId}: ${result.ride.car}`, ...prev].slice(0, 4));
    } catch (error) {
      setActivity((prev) => [`Book failed: ${error.message}`, ...prev].slice(0, 4));
    }
  }

  return (
    <ScreenLayout navigation={navigation} route={route} className="bg-dark">
      <View style={styles.container} className="px-6">
        <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>Live groups</Text>
          <Text style={styles.heroSubtitle}>Join or start a crew and unlock member-only ride details.</Text>
        </ImageBackground>

        <View style={styles.groupList}>
          {groups.length === 0 ? (
            <Text style={styles.message}>No groups available yet. Create one to get started.</Text>
          ) : (
            groups.map((group) => (
              <View key={group.id} style={styles.card}>
                <View style={styles.headerRow}>
                  <Text style={styles.groupTitle}>{group.origin} → {group.location}</Text>
                  <Text style={styles.memberPill}>{group.memberCount} riders</Text>
                </View>
                <Text style={styles.groupMeta}>Date: {group.schedule_date} • Time: {group.time}</Text>
                <Text style={styles.groupMeta}>Join by: {group.join_deadline ? new Date(group.join_deadline).toLocaleString() : 'No deadline set'}</Text>
                <Text style={styles.groupMeta}>Budget: GHS{group.budget}</Text>
                <Text style={styles.groupMeta}>Max members: {group.max_members || 'N/A'} • Share: GHS{group.paymentAmount || 0}</Text>
                {group.isMember ? (
                  <View style={styles.memberBox}>
                    <Text style={styles.memberTitle}>Group members</Text>
                    {group.members.length === 0 ? (
                      <Text style={styles.memberText}>You're the first rider in this group.</Text>
                    ) : (
                      group.members.map((member) => (
                        <Text key={member.membershipId || member.id} style={styles.memberText}>• {member.name} {member.status ? `(${member.status})` : ''}</Text>
                      ))
                    )}
                  </View>
                ) : (
                  <Text style={styles.hint}>Join this group to see rider activity, member names, and booking updates.</Text>
                )}
                <View style={styles.cardFooter}>
                  <TouchableOpacity style={[styles.joinButton, (!group.canJoin || group.isMember) && styles.disabledButton]} onPress={() => handleJoin(group.id)} disabled={!group.canJoin || group.isMember}>
                    <Text style={styles.buttonText}>{group.isMember ? 'Joined' : group.canJoin ? 'Join' : 'Closed'}</Text>
                  </TouchableOpacity>
                  {group.isMember && group.members?.find((member) => member.userId === currentUser?.id)?.status === 'probation' ? (
                    <TouchableOpacity style={styles.bookButton} onPress={() => handlePay(group)}>
                      <Text style={styles.buttonText}>Pay GHS{group.paymentAmount || 0}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.bookButton, !group.isMember && styles.disabledButton]} onPress={() => handleBook(group.id)} disabled={!group.isMember}>
                      <Text style={styles.buttonText}>{group.isMember ? 'Book ride' : 'Members only'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {group.isMember && group.members?.find((member) => member.userId === currentUser?.id)?.status === 'verified' ? (
                  <Text style={styles.closedText}>Your membership is verified.</Text>
                ) : null}
                {!group.canJoin && !group.isMember ? <Text style={styles.closedText}>Joining is closed for this group.</Text> : null}
              </View>
            ))
          )}

          <Text style={styles.feedTitle}>Activity</Text>
          <View style={styles.activityBox}>
            {activity.length === 0 ? (
              <Text style={styles.activityText}>No events yet. Stay tuned for group activity.</Text>
            ) : (
              activity.map((item, index) => (
                <Text key={index} style={styles.activityText}>{item}</Text>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Back home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061426' },
  hero: { height: 200, padding: 24, justifyContent: 'flex-end' },
  heroImage: { opacity: 0.75 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 21, 39, 0.55)' },
  heroTitle: { color: 'white', fontSize: 30, fontWeight: '900', marginBottom: 6 },
  heroSubtitle: { color: '#d4f4fb', fontSize: 14, lineHeight: 20 },
  groupList: { flex: 1, paddingHorizontal: 24 },
  groupContent: { paddingBottom: 32, paddingTop: 16 },
  card: { backgroundColor: '#0f3153', borderRadius: 22, padding: 20, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(33,211,199,0.16)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupTitle: { color: 'white', fontSize: 18, fontWeight: '800', flex: 1, marginRight: 12 },
  memberPill: { color: '#21d3c7', fontWeight: '700' },
  groupMeta: { color: '#aecde5', marginTop: 8, marginBottom: 14 },
  memberBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 14, marginBottom: 14 },
  memberTitle: { color: '#c2edf8', fontWeight: '700', marginBottom: 8 },
  memberText: { color: '#d9f3ff', marginBottom: 4 },
  hint: { color: '#9ccfe3', marginBottom: 14, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  joinButton: { backgroundColor: '#21d3c7', padding: 14, borderRadius: 16, flex: 1, marginRight: 10, alignItems: 'center' },
  bookButton: { backgroundColor: '#ff7a1a', padding: 14, borderRadius: 16, flex: 1, alignItems: 'center' },
  primaryButton: { backgroundColor: '#21d3c7', padding: 16, borderRadius: 18, marginTop: 12, marginBottom: 32, alignItems: 'center' },
  disabledButton: { opacity: 0.55, backgroundColor: '#214a6b' },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 15 },
  feedTitle: { color: '#cef1ff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  activityBox: { backgroundColor: '#0a233d', borderRadius: 18, padding: 18, marginBottom: 16 },
  activityText: { color: '#b9e4fb', marginBottom: 10, lineHeight: 20 },
  closedText: { color: '#ffb36b', marginTop: 8, fontWeight: '700' }
});
