import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGuideById } from '../../api/firstAidApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Asset & Config Maps ────────────────────────────────────────────────────────
const CPR_VIDEO_MAP = {
  adult: { videoUrl: require('../../../assets/videos/Adult.mp4'), title: 'CPR for Adults', duration: '3:45', category: 'cpr' },
  child: { videoUrl: require('../../../assets/videos/chil.mp4'), title: 'CPR for Children', duration: '4:10', category: 'cpr' },
  baby: { videoUrl: require('../../../assets/videos/baby.mp4'), title: 'CPR for Baby', duration: '2:41', category: 'cpr' },
};

const GUIDE_VIDEO_MAP = {
  local_cpr: { videoUrl: require('../../../assets/videos/cpr.mp4'), title: 'How to Perform CPR', duration: '3:50', category: 'cpr' },
  local_choking: { videoUrl: require('../../../assets/videos/choking.mp4'), title: 'Heimlich Maneuver for Choking', duration: '2:41', category: 'choking' },
  local_burns: { videoUrl: require('../../../assets/videos/burns.mp4'), title: 'Treating Burns Properly', duration: '1:30', category: 'burns' },
  local_bleeding: { videoUrl: require('../../../assets/videos/bleeding.mp4'), title: 'Controlling Severe Bleeding', duration: '4:27', category: 'bleeding' },
  local_fractures: { videoUrl: require('../../../assets/videos/fractures.mp4'), title: 'Fracture Immobilization', duration: '2:52', category: 'fractures' },
  local_seizure: { videoUrl: require('../../../assets/videos/seizures.mp4'), title: 'Seizure Guidelines', duration: '2:35', category: 'seizures' },
  local_stroke: { videoUrl: require('../../../assets/videos/stroke.mp4'), title: 'Stroke Recognition', duration: '3:15', category: 'stroke' },
  local_poison: { videoUrl: require('../../../assets/videos/poison.mp4'), title: 'Poisoning Response', duration: '2:20', category: 'poisoning' },
  local_heatstroke: { videoUrl: require('../../../assets/videos/heatstroke.mp4'), title: 'Heat Stroke Response', duration: '3:05', category: 'heatstroke' },
};

const SEVERITY_COLORS = {
  critical: '#e74c3c',
  high: '#e67e22',
  medium: '#f39c12',
  low: '#27ae60',
};

const SEVERITY_BG = {
  critical: '#fdecea',
  high: '#fef5ec',
  medium: '#fef9e7',
  low: '#e9f7ef',
};

const PLACEHOLDER_ICONS = {
  cpr: 'heart',
  choking: 'warning',
  burns: 'flame',
  bleeding: 'bandage',
  fractures: 'body',
  seizures: 'pulse',
  seizure: 'pulse',
  stroke: 'sunny',
  poison: 'skull',
  other: 'list',
};

const CPR_MODE_CONFIG = [
  {
    key: 'adult',
    label: 'Adult',
    ageNote: 'Ages 8 and older',
    icon: 'person',
    color: '#e74c3c',
    bg: '#fdecea',
    details: ['Use 2 hands', 'Push 2 inches deep', '30 compressions : 2 breaths'],
  },
  {
    key: 'child',
    label: 'Child',
    ageNote: 'Ages 1 – 7',
    icon: 'body',
    color: '#e67e22',
    bg: '#fef5ec',
    details: ['Use 1 or 2 hands', 'Push 2 inches deep', '30 compressions : 2 breaths'],
  },
  {
    key: 'baby',
    label: 'Baby / Infant',
    ageNote: 'Under 1 year old',
    icon: 'happy',
    color: '#8e44ad',
    bg: '#f5eef8',
    details: ['Use 2 fingers only', 'Push 1.5 inches deep', '30 compressions : 2 breaths'],
  },
];

// ── Fullscreen Image Modal Component ──────────────────────────────────────────
function ImageModal({ visible, imageSource, caption, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity activeOpacity={1} style={modalStyles.imgContainer} onPress={onClose}>
          {imageSource && (
            <Image source={imageSource} style={modalStyles.fullImg} resizeMode="contain" />
          )}
        </TouchableOpacity>

        <View style={modalStyles.footer}>
          {caption ? (
            <Text style={modalStyles.captionText}>{caption}</Text>
          ) : (
            <Text style={modalStyles.tapHintText}>Tap anywhere to close</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── CPR Selector Component ────────────────────────────────────────────────────
function CprSelector({ guide, onSelect, sevColor }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={cprStyles.container} showsVerticalScrollIndicator={false}>
      <View style={cprStyles.promptRow}>
        <Ionicons name="help-circle" size={28} color={sevColor} />
        <View style={{ flex: 1 }}>
          <Text style={cprStyles.promptTitle}>Who needs CPR?</Text>
          <Text style={cprStyles.promptSub}>Select the victim's age group to see the correct technique</Text>
        </View>
      </View>

      {CPR_MODE_CONFIG.map((mode) => (
        <TouchableOpacity
          key={mode.key}
          style={[cprStyles.modeCard, { borderLeftColor: mode.color }]}
          onPress={() => onSelect(mode.key)}
          activeOpacity={0.85}
        >
          <View style={[cprStyles.modeHeader, { backgroundColor: mode.bg }]}>
            <View style={[cprStyles.modeIconWrap, { backgroundColor: mode.color }]}>
              <Ionicons name={mode.icon} size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[cprStyles.modeLabel, { color: mode.color }]}>{mode.label}</Text>
              <Text style={cprStyles.modeAge}>{mode.ageNote}</Text>
            </View>
            <View style={[cprStyles.startBtn, { backgroundColor: mode.color }]}>
              <Text style={cprStyles.startBtnText}>Start</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </View>
          </View>

          <View style={cprStyles.detailsRow}>
            {mode.details.map((d, i) => (
              <View key={i} style={cprStyles.detailItem}>
                <Ionicons name="checkmark-circle" size={14} color={mode.color} />
                <Text style={cprStyles.detailText}>{d}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function GuideDetailScreen({ navigation, route }) {
  const { guideId, localGuide } = route.params || {};

  const [guide, setGuide] = useState(localGuide || null);
  const [loading, setLoading] = useState(!localGuide);
  const [activeStep, setActiveStep] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalCaption, setModalCaption] = useState('');
  const [cprMode, setCprMode] = useState(null);

  const scrollRef = useRef(null);
  const stepLayouts = useRef({});

  // Hide the default navigation header so "Guide Detail" title never appears
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const guideKey = guideId || localGuide?._id;
  const isCpr = guide?.hasCprModes === true;
  const linkedVideo = (isCpr && cprMode) ? (CPR_VIDEO_MAP[cprMode] || null) : (GUIDE_VIDEO_MAP[guideKey] || null);

  useEffect(() => {
    if (!localGuide) fetchGuide();
  }, [guideId]);

  useEffect(() => {
    setCprMode(null);
    setActiveStep(0);
  }, [guideKey]);

  const fetchGuide = async () => {
    try {
      const data = await getGuideById(guideId);
      if (data?.guide) setGuide(data.guide);
    } catch (_) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleImgError = (idx) => setImgErrors((prev) => ({ ...prev, [idx]: true }));

  const scrollToStep = (idx) => {
    setActiveStep(idx);
    const yOffset = stepLayouts.current[idx];
    if (yOffset !== undefined) {
      scrollRef.current?.scrollTo({ y: yOffset - 10, animated: true });
    }
  };

  const openImage = (imageSource, caption = '') => {
    setModalImage(imageSource);
    setModalCaption(caption);
    setModalVisible(true);
  };

  const call911 = () => {
    Alert.alert('🚨 Call Emergency Services', 'Do you want to place a call to emergency services right now?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
    ]);
  };

  const handleWatchVideo = () => {
    if (!linkedVideo) return;
    navigation.navigate('Videos', { autoPlay: linkedVideo });
  };

  // Single back button logic
  const handleBack = () => {
    if (isCpr && cprMode) {
      setCprMode(null);
      setActiveStep(0);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('GuidesList');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Loading details…</Text>
      </View>
    );
  }

  if (!guide) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Topic not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeModeConfig = isCpr && cprMode ? CPR_MODE_CONFIG.find((m) => m.key === cprMode) : null;
  const sevColor = activeModeConfig ? activeModeConfig.color : (SEVERITY_COLORS[guide.severity] || '#e74c3c');
  const sevBg = activeModeConfig ? activeModeConfig.bg : (SEVERITY_BG[guide.severity] || '#fdecea');

  const stepsToRender = isCpr && cprMode ? (guide.cprModes?.[cprMode]?.steps || []) : (guide.steps || []);
  const totalSteps = stepsToRender.length;
  const placeholderIcon = PLACEHOLDER_ICONS[guide.category] || 'medical';

  // Dynamic Header Title (Replaces "Guide Detail")
  const screenTitle = isCpr && activeModeConfig
    ? `CPR: ${activeModeConfig.label}`
    : (guide?.title || route.params?.title || 'First Aid Guide');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar backgroundColor={sevColor} barStyle="light-content" />
      {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight || 0 }} />}

      <ImageModal
        visible={modalVisible}
        imageSource={modalImage}
        caption={modalCaption}
        onClose={() => setModalVisible(false)}
      />

      {/* Single Clean Custom Sticky Header */}
      <View style={[styles.stickyHeader, { backgroundColor: sevColor }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backArrow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.stickyTitle} numberOfLines={1}>{screenTitle}</Text>

        <TouchableOpacity onPress={call911} style={styles.sos}>
          <Ionicons name="call" size={15} color="#fff" />
          <Text style={styles.sosText}>911</Text>
        </TouchableOpacity>
      </View>

      {/* Content Flow */}
      {isCpr && !cprMode ? (
        <CprSelector
          guide={guide}
          onSelect={setCprMode}
          sevColor={sevColor}
        />
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Navigation Step Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
            {stepsToRender.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.pill, activeStep === idx && { backgroundColor: sevColor, borderColor: sevColor }]}
                onPress={() => scrollToStep(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillNum, activeStep === idx && { color: '#fff' }]}>{idx + 1}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.stepsSectionLabel}>STEP-BY-STEP INSTRUCTIONS</Text>

          {/* Render Steps List */}
          {stepsToRender.map((step, idx) => {
            const hasImg = step.image && !imgErrors[idx];
            const isActive = activeStep === idx;
            const isLast = idx === totalSteps - 1;
            const imgSrc = hasImg
              ? (typeof step.image === 'string' ? { uri: step.image } : step.image)
              : null;

            return (
              <React.Fragment key={idx}>
                <TouchableOpacity
                  style={[styles.stepCard, isActive && { borderColor: sevColor, borderWidth: 2 }]}
                  onPress={() => setActiveStep(idx)}
                  onLayout={(event) => {
                    stepLayouts.current[idx] = event.nativeEvent.layout.y;
                  }}
                  activeOpacity={0.95}
                >
                  <View style={[styles.stepHeader, { backgroundColor: sevBg }]}>
                    <View style={[styles.stepNum, { backgroundColor: sevColor }]}>
                      <Text style={styles.stepNumText}>{step.stepNumber || idx + 1}</Text>
                    </View>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                  </View>

                  {hasImg ? (
                    <TouchableOpacity
                      activeOpacity={0.92}
                      onPress={() => openImage(imgSrc, step.imageCaption || '')}
                      style={styles.stepImgWrap}
                    >
                      <Image
                        source={imgSrc}
                        style={styles.stepImg}
                        resizeMode="cover"
                        onError={() => handleImgError(idx)}
                      />
                      <View style={styles.expandBadge}>
                        <Ionicons name="expand-outline" size={13} color="#fff" />
                        <Text style={styles.expandBadgeText}>Tap to expand</Text>
                      </View>
                      {step.imageCaption && (
                        <View style={styles.imgCaptionBar}>
                          <Ionicons name="camera-outline" size={12} color="#fff" />
                          <Text style={styles.imgCaption}>{step.imageCaption}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.stepImgPlaceholder, { backgroundColor: sevBg }]}>
                      <Ionicons name={placeholderIcon} size={48} color={sevColor} />
                      <Text style={[styles.placeholderLabel, { color: sevColor }]}>Step {step.stepNumber || idx + 1}</Text>
                    </View>
                  )}

                  <View style={styles.stepBody}>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </TouchableOpacity>

                {/* Video Link */}
                {isLast && linkedVideo && (
                  <TouchableOpacity
                    style={[styles.watchVideoBtn, { backgroundColor: sevColor }]}
                    onPress={handleWatchVideo}
                    activeOpacity={0.88}
                  >
                    <View style={styles.watchVideoLeft}>
                      <View style={styles.watchVideoIconWrap}>
                        <Ionicons name="play" size={24} color={sevColor} style={{ marginLeft: 3 }} />
                      </View>
                      <View style={styles.watchVideoInfo}>
                        <Text style={styles.watchVideoLabel}>WATCH VIDEO GUIDE</Text>
                        <Text style={styles.watchVideoTitle} numberOfLines={1}>{linkedVideo.title}</Text>
                        <View style={styles.watchVideoDurRow}>
                          <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.85)" />
                          <Text style={styles.watchVideoDur}>{linkedVideo.duration} min</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                  </TouchableOpacity>
                )}
              </React.Fragment>
            );
          })}

          {/* Warnings Section */}
          {guide.warnings?.length > 0 && (
            <View style={styles.warningsCard}>
              <View style={styles.warningsHeader}>
                <Ionicons name="warning" size={20} color="#e67e22" />
                <Text style={styles.warningsTitle}>Important Warnings</Text>
              </View>
              {guide.warnings.map((w, i) => (
                <View key={i} style={styles.warningRow}>
                  <View style={styles.warningDot} />
                  <Text style={styles.warningText}>{w}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Emergency Section */}
          {guide.whenToCallEmergency?.length > 0 && (
            <View style={styles.emergencyCard}>
              <View style={styles.emergencyCardHeader}>
                <Ionicons name="medical" size={20} color="#e74c3c" />
                <Text style={styles.emergencyCardTitle}>When to Call Emergency Services</Text>
              </View>
              {guide.whenToCallEmergency.map((item, i) => (
                <View key={i} style={styles.emergencyRow}>
                  <Ionicons name="alert-circle" size={15} color="#e74c3c" />
                  <Text style={styles.emergencyRowText}>{item}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.call911Btn} onPress={call911} activeOpacity={0.85}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.call911Text}>Call 911 Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Stylesheet ────────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 25, right: 20, zIndex: 10, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  imgContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.75, justifyContent: 'center', alignItems: 'center' },
  fullImg: { width: SCREEN_WIDTH, height: '100%' },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 },
  captionText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
  tapHintText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
});

const cprStyles = StyleSheet.create({
  container: { padding: 16 },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 8 },
  promptTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  promptSub: { fontSize: 12, color: '#666', lineHeight: 16 },

  modeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    borderLeftWidth: 5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  modeHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  modeIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  modeLabel: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  modeAge: { fontSize: 12, color: '#666' },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  startBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  detailsRow: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4, gap: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: '#555' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 15 },
  errorText: { marginTop: 12, color: '#888', fontSize: 16 },
  backBtn: { marginTop: 20, backgroundColor: '#e74c3c', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },

  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  backArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  stickyTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: '#fff' },
  sos: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  sosText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  pillsRow: { paddingBottom: 14, gap: 8 },
  pill: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  pillNum: { fontSize: 13, fontWeight: '800', color: '#555' },

  stepsSectionLabel: { fontSize: 11, fontWeight: '800', color: '#999', letterSpacing: 1.2, marginBottom: 12 },

  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  stepNum: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1a1a2e' },

  stepImgWrap: { position: 'relative' },
  stepImg: { width: '100%', height: 200 },
  expandBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  expandBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  imgCaptionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  imgCaption: { color: '#fff', fontSize: 12, fontStyle: 'italic', flex: 1 },
  stepImgPlaceholder: { height: 130, justifyContent: 'center', alignItems: 'center', gap: 6 },
  placeholderLabel: { fontSize: 12, fontWeight: '700' },

  stepBody: { padding: 14 },
  stepDesc: { fontSize: 14, color: '#444', lineHeight: 22 },

  watchVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  watchVideoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  watchVideoIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  watchVideoInfo: { flex: 1 },
  watchVideoLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1, marginBottom: 2 },
  watchVideoTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 2 },
  watchVideoDurRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  watchVideoDur: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  warningsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#e67e22', elevation: 2 },
  warningsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  warningsTitle: { fontSize: 15, fontWeight: '800', color: '#e67e22' },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  warningDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e67e22', marginTop: 6 },
  warningText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 19 },

  emergencyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#e74c3c', elevation: 2 },
  emergencyCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  emergencyCardTitle: { fontSize: 15, fontWeight: '800', color: '#e74c3c' },
  emergencyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  emergencyRowText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 19 },
  call911Btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#e74c3c', borderRadius: 10, paddingVertical: 12, marginTop: 10 },
  call911Text: { color: '#fff', fontSize: 15, fontWeight: '900' },
});