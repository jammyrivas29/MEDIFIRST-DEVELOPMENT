import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Linking, Alert, ActivityIndicator, ScrollView,
  SafeAreaView, StatusBar, Platform, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const SEARCH_RADIUS = 5000;
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

function formatDistance(m) {
  if (!m && m !== 0) return 'Nearby';
  return m < 1000 ? `${Math.round(m)} m away` : `${(m / 1000).toFixed(1)} km away`;
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildAddress(tags) {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'] || tags['addr:suburb'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Address not available';
}

function parseElements(elements) {
  return elements
    .map((el) => {
      const lat  = el.lat ?? el.center?.lat;
      const lon  = el.lon ?? el.center?.lon;
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || null;
      const phone =
        tags.phone ||
        tags['contact:phone'] ||
        tags['contact:mobile'] ||
        tags['phone:emergency'] ||
        null;
      const website =
        tags.website ||
        tags['contact:website'] ||
        tags.url ||
        null;
      return {
        id: el.id.toString(),
        name,
        address: buildAddress(tags),
        phone,
        website,
        operator: tags.operator || null,
        openingHours: tags.opening_hours || null,
        emergency: tags.emergency || null,
        wheelchair: tags.wheelchair || null,
        healthcare: tags.healthcare || null,
        lat,
        lng: lon,
      };
    })
    .filter(h => h.lat && h.lng && h.name);
}

function normalizePhone(p) {
  if (!p) return '';
  return p.replace(/[^\d+]/g, '');
}

async function fetchNearbyHospitals(latitude, longitude) {
  const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:${SEARCH_RADIUS},${latitude},${longitude});way["amenity"="hospital"](around:${SEARCH_RADIUS},${latitude},${longitude}););out center;`;
  const tryServer = (server) =>
    fetch(server, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    }).then(async (res) => {
      const text = await res.text();
      if (!text.trim().startsWith('{')) throw new Error('Non-JSON response');
      const data = JSON.parse(text);
      if (!data.elements) throw new Error('No elements');
      return parseElements(data.elements);
    });
  try {
    return await Promise.any(OVERPASS_SERVERS.map(tryServer));
  } catch {
    throw new Error('All servers unavailable. Check your internet connection and try again.');
  }
}

export default function HospitalLocatorScreen() {
  const navigation = useNavigation();
  const isGuest = useSelector((state) => state.auth?.isGuest);
  const [location,        setLocation]        = useState(null);
  const [hospitals,       setHospitals]       = useState([]);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [loading,         setLoading]         = useState(true);
  const [loadingMsg,      setLoadingMsg]      = useState('Getting your location…');
  const [error,           setError]           = useState(null);
  const [detailsHospital, setDetailsHospital] = useState(null);

  useEffect(() => { initLocation(); }, []);

  const initLocation = async () => {
    setLoading(true);
    setError(null);
    setHospitals([]);
    setSearchQuery('');
    setLoadingMsg('Getting your location…');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby hospitals.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      setLoadingMsg('Searching nearby hospitals…');
      const results = await fetchNearbyHospitals(coords.latitude, coords.longitude);
      const withDistance = results
        .map(h => ({ ...h, distanceMeters: getDistanceMeters(coords.latitude, coords.longitude, h.lat, h.lng) }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 20);
      setHospitals(withDistance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const callHospital = (phone, name) => {
    const p = normalizePhone(phone);
    if (!p) { Alert.alert('No Phone Number', `${name} has no phone number listed.`); return; }
    Alert.alert(`Call ${name}`, `Dial ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL(`tel:${p}`) },
    ]);
  };

  const showDetails = (item) => setDetailsHospital(item);

  const getDirections = (lat, lng, name) => {
    Alert.alert(`Directions to ${name}`, 'Open in Google Maps?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Maps', onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`) },
    ]);
  };

  const openAllOnMap = () => {
    if (location) {
      const { latitude, longitude } = location;
      Linking.openURL(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},15z/data=!3m1!4b1`);
    }
  };

  // Filter hospitals based on search input
  const filteredHospitals = hospitals.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = item.name?.toLowerCase().includes(query);
    const addressMatch = item.address?.toLowerCase().includes(query);
    return nameMatch || addressMatch;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <SafeAreaView style={styles.headerLoading}>
          {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}><FontAwesome6 name="hospital" size={20} color="#fff" /></View>
              <View>
                <Text style={styles.headerTitle}>Hospital Locator</Text>
                <Text style={styles.headerSub}>Find emergency care near you</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.loadingBody}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingTitle}>Finding Nearby Hospitals</Text>
          <Text style={styles.loadingSubtitle}>{loadingMsg}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>

      <SafeAreaView style={styles.header}>
        {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}><FontAwesome6 name="hospital" size={20} color="#fff" /></View>
            <View>
              <Text style={styles.headerTitle}>Hospital Locator</Text>
              <Text style={styles.headerSub}>Find emergency care near you</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.gpsBadge, { backgroundColor: location ? 'rgba(46,204,113,0.25)' : 'rgba(255,255,255,0.15)' }]}>
              <View style={[styles.gpsDot, { backgroundColor: location ? '#2ecc71' : '#f39c12' }]} />
              <Text style={styles.gpsText}>{location ? 'GPS On' : 'No GPS'}</Text>
            </View>
            {isGuest && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerCloseBtn} activeOpacity={0.85}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.hdrStrip}>
          <View style={styles.hdrLiveDot} />
          <Text style={styles.hdrStripText}>Showing hospitals within {SEARCH_RADIUS / 1000}km of your location</Text>
        </View>
      </SafeAreaView>

      <View style={styles.statsRow}>
        {[
          { num: hospitals.length || '—',   label: 'Found',     icon: 'business',         color: '#27ae60' },
          { num: `${SEARCH_RADIUS/1000}km`, label: 'Radius',    icon: 'radio-button-on',  color: '#2980b9' },
          { num: 'Free',                    label: 'No Key',    icon: 'shield-checkmark', color: '#8e44ad' },
          { num: 'Live',                    label: 'Real Data', icon: 'checkmark-done',   color: '#e74c3c' },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon} size={13} color={s.color} />
              </View>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      <TouchableOpacity style={styles.mapCta} onPress={openAllOnMap} activeOpacity={0.85}>
        <View style={styles.mapCtaIcon}><Ionicons name="map" size={22} color="#fff" /></View>
        <View style={styles.mapCtaBody}>
          <Text style={styles.mapCtaTitle}>View All on Google Maps</Text>
          <Text style={styles.mapCtaSub}>See hospitals near your location</Text>
        </View>
        <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 14 }} />
      </TouchableOpacity>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospital by name or street..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && Platform.OS !== 'ios' && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionRow}>
        <View>
          <Text style={styles.sectionLabel}>NEARBY FACILITIES</Text>
          <Text style={styles.sectionTitle}>
            {filteredHospitals.length > 0
              ? `${filteredHospitals.length} ${searchQuery ? 'Matching' : ''} Hospitals`
              : error ? 'Could Not Load' : 'No Hospitals Found'}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={initLocation} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color="#27ae60" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="wifi-outline" size={32} color="#e74c3c" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={initLocation}>
            <Text style={styles.retryText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && hospitals.length === 0 && (
        <View style={styles.errorCard}>
          <Ionicons name="business-outline" size={32} color="#ccc" />
          <Text style={styles.errorTitle}>No hospitals found within 5km</Text>
          <Text style={styles.errorSub}>Try refreshing or check your GPS signal.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={initLocation}>
            <Text style={styles.retryText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && hospitals.length > 0 && filteredHospitals.length === 0 && (
        <View style={styles.errorCard}>
          <Ionicons name="search-outline" size={32} color="#ccc" />
          <Text style={styles.errorTitle}>No hospital matches "{searchQuery}"</Text>
          <Text style={styles.errorSub}>Try checking the spelling or clear the search field.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setSearchQuery('')}>
            <Text style={styles.retryText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredHospitals.map((item, index) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.cardIconWrap}>
              <MaterialCommunityIcons name="hospital-marker" size={22} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.cardMeta}>
                <View style={styles.distBadge}>
                  <Ionicons name="location" size={11} color="#e74c3c" />
                  <Text style={styles.distText}>{formatDistance(item.distanceMeters)}</Text>
                </View>
                {item.id === hospitals[0]?.id && (
                  <View style={styles.nearestBadge}>
                    <Text style={styles.nearestText}>⚡ Nearest</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardAddress} numberOfLines={2}>{item.address}</Text>
              <View style={styles.phoneRow}>
                <Ionicons name="call" size={11} color={item.phone ? '#27ae60' : '#ccc'} />
                <Text style={[styles.phoneText, !item.phone && styles.noPhone]}>
                  {item.phone ?? 'No number listed'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: item.phone ? '#27ae60' : '#ccc' }]}
              onPress={() => callHospital(item.phone, item.name)}
              activeOpacity={0.85}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#2980b9' }]}
              onPress={() => getDirections(item.lat, item.lng, item.name)}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#8e44ad' }]}
              onPress={() => showDetails(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="information-circle" size={16} color="#fff" />
              <Text style={styles.actionText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {hospitals.length > 0 && (
        <View style={styles.disclaimer}>
          <Ionicons name="shield-checkmark" size={14} color="#aaa" />
          <Text style={styles.disclaimerText}>
            Data from OpenStreetMap. Phone numbers shown are from OSM data only. In a life-threatening emergency, always call 911 immediately.
          </Text>
        </View>
      )}

      <HospitalDetailModal
        hospital={detailsHospital}
        onClose={() => setDetailsHospital(null)}
        onCall={(p, n) => callHospital(p, n)}
        onDirections={(lat, lng, n) => getDirections(lat, lng, n)}
      />
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, onPress, isLink }) {
  if (!value) return null;
  const content = (
    <>
      <View style={dmStyles.rowIcon}><Ionicons name={icon} size={16} color="#27ae60" /></View>
      <View style={dmStyles.rowBody}>
        <Text style={dmStyles.rowLabel}>{label}</Text>
        <Text style={[dmStyles.rowValue, isLink && dmStyles.rowLink]} numberOfLines={isLink ? 1 : 3}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
    </>
  );
  if (onPress) {
    return <TouchableOpacity style={dmStyles.row} onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return <View style={dmStyles.row}>{content}</View>;
}

function HospitalDetailModal({ hospital, onClose, onCall, onDirections }) {
  if (!hospital) return null;
  const p = normalizePhone(hospital.phone);
  return (
    <Modal visible={!!hospital} transparent animationType="slide" onRequestClose={onClose}>
      <View style={dmStyles.overlay}>
        <View style={dmStyles.sheet}>
          <View style={dmStyles.grabber} />
          <View style={dmStyles.head}>
            <View style={dmStyles.headIcon}><Ionicons name="business" size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={dmStyles.headName} numberOfLines={2}>{hospital.name}</Text>
              <Text style={dmStyles.headDist}>{formatDistance(hospital.distanceMeters)} from your location</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={dmStyles.closeBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={dmStyles.body} showsVerticalScrollIndicator={false}>
            <DetailRow icon="location" label="Address" value={hospital.address} />
            <DetailRow
              icon="call"
              label="Phone"
              value={hospital.phone || 'No phone number listed'}
              isLink={!!p}
              onPress={p ? () => onCall(hospital.phone, hospital.name) : null}
            />
            <DetailRow
              icon="globe"
              label="Website"
              value={hospital.website}
              isLink={!!hospital.website}
              onPress={hospital.website ? () => Linking.openURL(hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`) : null}
            />
            <DetailRow icon="business" label="Operator" value={hospital.operator} />
            <DetailRow icon="time" label="Opening Hours" value={hospital.openingHours} />
            <DetailRow
              icon="medical"
              label="Emergency Dept."
              value={hospital.emergency ? (hospital.emergency === 'yes' ? 'Available' : 'Not available') : null}
            />
            <DetailRow icon="accessibility" label="Wheelchair Access" value={hospital.wheelchair || null} />
            <DetailRow icon="medkit" label="Healthcare Type" value={hospital.healthcare || null} />

            <View style={dmStyles.actionRow}>
              <TouchableOpacity
                style={[dmStyles.bigBtn, { backgroundColor: p ? '#27ae60' : '#ccc' }]}
                onPress={() => onCall(hospital.phone, hospital.name)}
                activeOpacity={0.85}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={dmStyles.bigBtnText}>{p ? 'Call Hospital' : 'No Number'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dmStyles.bigBtn, { backgroundColor: '#2980b9' }]}
                onPress={() => onDirections(hospital.lat, hospital.lng, hospital.name)}
                activeOpacity={0.85}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={dmStyles.bigBtnText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },

  center:          { flex: 1, backgroundColor: '#f5f6f8' },
  headerLoading:   { backgroundColor: '#27ae60', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  loadingBody:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingTitle:    { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginTop: 16 },
  loadingSubtitle: { fontSize: 13, color: '#888', marginTop: 6 },

  header:      { backgroundColor: '#27ae60', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, gap: 10 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerIcon:  { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  hdrStrip:     { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(0,0,0,0.12)', paddingHorizontal: 16, paddingVertical: 8 },
  hdrLiveDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ecc71' },
  hdrStripText: { fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: '500', flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  gpsBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  gpsDot:      { width: 7, height: 7, borderRadius: 4 },
  gpsText:     { fontSize: 11, fontWeight: '700', color: '#fff' },

  statsRow:    { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  statItem:    { flex: 1, alignItems: 'center', gap: 3 },
  statIcon:    { width: 26, height: 26, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  statNum:     { fontSize: 14, fontWeight: '900', color: '#1a1a2e' },
  statLabel:   { fontSize: 9, color: '#aaa', textAlign: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: '#eee' },

  mapCta:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2980b9', marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: 'hidden', elevation: 3 },
  mapCtaIcon:  { width: 56, alignSelf: 'stretch', backgroundColor: '#1a5276', justifyContent: 'center', alignItems: 'center' },
  mapCtaBody:  { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  mapCtaTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  mapCtaSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a2e',
  },
  clearBtn: {
    padding: 4,
  },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 18, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#27ae60', letterSpacing: 1.5, marginBottom: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  refreshBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e9f7ef', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  refreshText:  { fontSize: 12, fontWeight: '700', color: '#27ae60' },

  errorCard:  { alignItems: 'center', padding: 30, backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, marginBottom: 12, elevation: 2 },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 12, marginBottom: 6 },
  errorSub:   { fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 18 },
  retryBtn:   { marginTop: 14, backgroundColor: '#e74c3c', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:  { color: '#fff', fontWeight: '700', fontSize: 13 },

  card:        { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  cardHeader:  { flexDirection: 'row', padding: 14, alignItems: 'flex-start' },
  rankBadge:   { width: 22, height: 22, borderRadius: 11, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2 },
  rankText:    { fontSize: 9, fontWeight: '800', color: '#888' },
  cardIconWrap:{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo:    { flex: 1 },
  cardName:    { fontSize: 14, fontWeight: '800', color: '#1a1a2e', lineHeight: 20, marginBottom: 5 },
  cardMeta:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' },
  distBadge:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  distText:    { fontSize: 12, color: '#e74c3c', fontWeight: '700' },
  nearestBadge:{ backgroundColor: '#fff3cd', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  nearestText: { fontSize: 10, fontWeight: '700', color: '#d68910' },
  cardAddress: { fontSize: 11, color: '#999', lineHeight: 16, marginBottom: 4 },
  phoneRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  phoneText:   { fontSize: 11, color: '#27ae60', fontWeight: '600' },
  noPhone:     { color: '#ccc', fontStyle: 'italic', fontWeight: '400' },
  divider:     { height: 1, backgroundColor: '#f4f4f4', marginHorizontal: 14 },
  cardActions: { flexDirection: 'row', padding: 12, gap: 8 },
  actionBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 10 },
  actionText:  { color: '#fff', fontWeight: '700', fontSize: 12 },

  disclaimer:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, marginTop: 8, padding: 14, backgroundColor: '#f0f0f0', borderRadius: 12 },
  disclaimerText: { flex: 1, fontSize: 11, color: '#999', lineHeight: 17 },
});

// ── Hospital Detail Modal styles ──
const dmStyles = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '88%', paddingBottom: 16 },
  grabber:   { width: 40, height: 5, borderRadius: 3, backgroundColor: '#ddd', alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  head:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 12 },
  headIcon:  { width: 46, height: 46, borderRadius: 14, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  headName:  { fontSize: 17, fontWeight: '800', color: '#1a1a2e', lineHeight: 22 },
  headDist:  { fontSize: 12, color: '#e74c3c', fontWeight: '700', marginTop: 2 },
  closeBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.08)', justifyContent: 'center', alignItems: 'center' },
  body:      { paddingHorizontal: 18, paddingTop: 8, maxHeight: 460 },
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f4f4f4' },
  rowIcon:   { width: 32, height: 32, borderRadius: 9, backgroundColor: '#e9f7ef', justifyContent: 'center', alignItems: 'center' },
  rowBody:   { flex: 1 },
  rowLabel:  { fontSize: 10, color: '#aaa', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  rowValue:  { fontSize: 14, color: '#1a1a2e', fontWeight: '600' },
  rowLink:   { color: '#2980b9' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 6 },
  bigBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  bigBtnText:{ color: '#fff', fontWeight: '800', fontSize: 14 },
});