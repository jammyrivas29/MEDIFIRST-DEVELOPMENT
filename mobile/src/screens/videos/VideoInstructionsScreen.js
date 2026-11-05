import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, StatusBar, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const VIDEOS = [
  { id: 1,  title: 'CPR Basics for Adults',        category: 'cpr',        duration: '3:45', videoUrl: require('../../../assets/videos/Adult.mp4'),     description: 'Learn the essential steps of performing CPR on adults in emergency situations.' },
  { id: 2,  title: 'CPR for Children',              category: 'cpr',        duration: '4:10', videoUrl: require('../../../assets/videos/chil.mp4'),      description: 'Step-by-step guide to performing CPR on children and infants safely and effectively.' },
  { id: 3,  title: 'CPR for Baby',                  category: 'cpr',        duration: '2:41', videoUrl: require('../../../assets/videos/baby.mp4'),      description: 'Step-by-step demonstration of the Heimlich maneuver to help someone who is choking.' },
  { id: 4,  title: 'Heimlich Maneuver for Choking', category: 'choking',    duration: '2:41', videoUrl: require('../../../assets/videos/choking.mp4'),   description: 'Step-by-step demonstration of the Heimlich maneuver to help someone who is choking.' },
  { id: 5,  title: 'Treating Burns Properly',       category: 'burns',      duration: '1:30', videoUrl: require('../../../assets/videos/burns.mp4'),     description: 'Learn how to properly treat first, second, and third-degree burns.' },
  { id: 6,  title: 'Controlling Severe Bleeding',   category: 'bleeding',   duration: '4:27', videoUrl: require('../../../assets/videos/bleeding.mp4'),  description: 'Techniques for applying pressure and controlling severe bleeding in emergency situations.' },
  { id: 7,  title: 'Fracture Immobilization',      category: 'fractures',  duration: '2:52', videoUrl: require('../../../assets/videos/fractures.mp4'), description: 'How to properly immobilize a fractured bone using splints and available materials.' },
  { id: 8,  title: 'Seizure Guidelines',            category: 'seizures',   duration: '2:35', videoUrl: require('../../../assets/videos/seizures.mp4'),  description: 'Learn how to safely assist someone experiencing a seizure.' },
  { id: 9,  title: 'Stroke Recognition',            category: 'stroke',     duration: '3:15', videoUrl: require('../../../assets/videos/stroke.mp4'),    description: 'Recognize the signs of a stroke and learn how to respond quickly.' },
  { id: 10, title: 'Poisoning Response',            category: 'poisoning',  duration: '2:20', videoUrl: require('../../../assets/videos/poison.mp4'),    description: 'Steps to take if you suspect someone has been poisoned.' },
  { id: 11, title: 'Heat Stroke Response',          category: 'heatstroke', duration: '3:05', videoUrl: require('../../../assets/videos/heatstroke.mp4'),description: 'Learn how to respond to heat stroke and prevent it from worsening.' },
];

const CATEGORY_COLORS = {
  cpr: '#e74c3c', choking: '#e74c3c', burns: '#f39c12',
  bleeding: '#e74c3c', fractures: '#f39c12', seizures: '#f39c12',
  heatstroke: '#e74c3c', stroke: '#e74c3c', poison: '#e74c3c',
};

const formatTime = (sec) => {
  if (!sec || isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ── Progress Bar (scrubable) ──────────────────────────────────────────────────
function ProgressBar({ progress, currentTime, duration, onSeek }) {
  const barRef = useRef(null);
  const [barWidth, setBarWidth] = useState(1);

  const handlePress = (e) => {
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / barWidth));
    onSeek(ratio * duration);
  };

  const pct = Math.min(Math.max((progress || 0) * 100, 0), 100);

  return (
    <TouchableOpacity
      ref={barRef}
      activeOpacity={1}
      onPress={handlePress}
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      style={pS.track}
      hitSlop={{ top: 12, bottom: 12 }}
    >
      <View style={pS.buffered} />
      <View style={[pS.fill, { width: `${pct}%` }]} />
      <View style={[pS.thumb, { left: `${pct}%` }]} />
    </TouchableOpacity>
  );
}

const pS = StyleSheet.create({
  track:    { height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, position: 'relative', justifyContent: 'center' },
  buffered: { position: 'absolute', left: 0, right: 0, height: '100%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
  fill:     { position: 'absolute', left: 0, height: '100%', backgroundColor: '#e74c3c', borderRadius: 2 },
  thumb:    { position: 'absolute', width: 13, height: 13, borderRadius: 7, backgroundColor: '#fff', marginLeft: -6, top: -5, elevation: 3 },
});

// ── Video Player ──────────────────────────────────────────────────────────────
function VideoPlayer({ selectedVideo, onClose }) {
  const [currentTime, setCurrentTime]         = useState(0);
  const [duration, setDuration]               = useState(0);
  const [isPlaying, setIsPlaying]             = useState(true);
  const [isReady, setIsReady]                 = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isEnded, setIsEnded]                 = useState(false);
  const hideTimer = useRef(null);

  const player = useVideoPlayer(selectedVideo.videoUrl, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
    p.play();
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') StatusBar.setBackgroundColor('#000');
    return () => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') StatusBar.setBackgroundColor('#e74c3c');
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => { try { player?.pause(); } catch (_) {} };
    }, [player])
  );

  const { status } = useEvent(player, 'statusChange', { status: player.status });
  useEffect(() => {
    try {
      setIsReady(status === 'readyToPlay');
      if (player?.duration > 0) setDuration(player.duration);
    } catch (_) {}
  }, [status]);

  const { isPlaying: eventPlaying } = useEvent(player, 'playingChange', { isPlaying: true });
  useEffect(() => { setIsPlaying(eventPlaying); }, [eventPlaying]);

  const { currentTime: eventTime } = useEvent(player, 'timeUpdate', { currentTime: 0, bufferedPosition: 0 });
  useEffect(() => {
    if (eventTime !== undefined && eventTime >= 0) {
      // Only re-render when the whole second changes → smoother, less jank
      setCurrentTime((prev) => (Math.floor(prev) !== Math.floor(eventTime) ? eventTime : prev));
      if (player?.duration > 0 && duration === 0) setDuration(player.duration);
      if (player?.duration > 0 && eventTime >= player.duration - 0.5) {
        setIsEnded(true);
        setIsPlaying(false);
      } else {
        setIsEnded(false);
      }
    }
  }, [eventTime]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!player) return;
    try { isPlaying ? player.pause() : player.play(); } catch (_) {}
    showControls();
  }, [player, isPlaying]);

  // Fixed Scrub / Seek functionality for expo-video
  const seekTo = useCallback((time) => {
    if (!player) return;
    try {
      player.currentTime = time;
      setCurrentTime(time);
    } catch (err) {
      console.warn('SeekTo error:', err);
    }
    showControls();
  }, [player, showControls]);

  const handleReplay = useCallback(() => {
    try {
      player.currentTime = 0;
      player.play();
      setIsEnded(false);
    } catch (_) {}
    showControls();
  }, [player, showControls]);

  const handleClose = useCallback(() => {
    try { player?.pause(); } catch (_) {}
    onClose();
  }, [player, onClose]);

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <View style={vS.root}>
      {/* ── VIDEO BOX ── */}
      <View style={vS.videoBox}>
        <VideoView
          player={player}
          style={vS.video}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls={false}
        />

        {/* Controls overlay */}
        <TouchableOpacity activeOpacity={1} style={vS.overlay} onPress={showControls}>
          {controlsVisible && (
            <View style={vS.controlsWrap}>
              {/* TOP BAR */}
              <View style={vS.topBar}>
                <TouchableOpacity onPress={handleClose} style={vS.backBtn} activeOpacity={0.8}>
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={vS.topTitle} numberOfLines={1}>{selectedVideo.title}</Text>
              </View>

              {/* CENTER CONTROLS (play / pause only) */}
              <View style={vS.centerRow}>
                <TouchableOpacity
                  onPress={isEnded ? handleReplay : togglePlayPause}
                  style={vS.playBtn}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={isEnded ? 'refresh' : isPlaying ? 'pause' : 'play'}
                    size={28}        // smaller icon size
                    color="#fff"       // keep same color
                  />
                </TouchableOpacity>
              </View>

              {/* BOTTOM BAR */}
              <View style={vS.bottomBar}>
                <Text style={vS.timeText}>{formatTime(currentTime)}</Text>
                <View style={vS.progressWrap}>
                  <ProgressBar
                    progress={progress}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seekTo}
                  />
                </View>
                <Text style={vS.timeText}>{duration > 0 ? formatTime(duration) : selectedVideo.duration}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {!isReady && (
          <View style={vS.loadingOverlay}>
            <Text style={vS.loadingText}>Loading...</Text>
          </View>
        )}
      </View>

      {/* ── VIDEO INFO ── */}
      <ScrollView style={vS.infoScroll} showsVerticalScrollIndicator={false}>
        <View style={vS.infoBox}>
          <View style={[vS.catBadge, { backgroundColor: (CATEGORY_COLORS[selectedVideo.category] || '#e74c3c') + '18' }]}>
            <Text style={[vS.catBadgeText, { color: CATEGORY_COLORS[selectedVideo.category] || '#e74c3c' }]}>
              {selectedVideo.category?.toUpperCase()}
            </Text>
          </View>

          <Text style={vS.infoTitle}>{selectedVideo.title}</Text>

          <View style={vS.durationRow}>
            <Ionicons name="time-outline" size={15} color="#aaa" />
            <Text style={vS.durationText}>
              {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : selectedVideo.duration}
            </Text>
          </View>

          <View style={vS.divider} />

          <Text style={vS.descLabel}>About this video</Text>
          <Text style={vS.descText}>{selectedVideo.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Player Styles ─────────────────────────────────────────────────────────────
const vS = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#0f0f0f' },
  videoBox:{ width, backgroundColor: '#000', paddingTop: StatusBar.currentHeight || 0 },
  video:   { width, height: width * 9 / 16 },

  overlay:      { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  controlsWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'space-between' },

  topBar:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: (StatusBar.currentHeight || 24) + 10, paddingBottom: 8, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  topTitle:{ flex: 1, color: '#fff', fontSize: 14, fontWeight: '700' },

  centerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
  playBtn:   { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },

  bottomBar:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  timeText:     { color: '#fff', fontSize: 12, fontWeight: '600', minWidth: 36 },
  progressWrap: { flex: 1 },

  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  loadingText:    { color: '#fff', fontSize: 13, fontWeight: '600' },

  infoScroll: { flex: 1, backgroundColor: '#fff' },
  infoBox:    { padding: 16 },
  catBadge:   { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  catBadgeText:{ fontSize: 11, fontWeight: '800' },
  infoTitle:  { fontSize: 18, fontWeight: '800', color: '#0f0f0f', marginBottom: 8, lineHeight: 24 },
  durationRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  durationText:{ fontSize: 13, color: '#aaa' },
  divider:    { height: 1, backgroundColor: '#f0f0f0', marginBottom: 14 },
  descLabel:   { fontSize: 12, fontWeight: '800', color: '#888', marginBottom: 6, letterSpacing: 0.5 },
  descText:    { fontSize: 14, color: '#444', lineHeight: 21 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function VideoInstructionsScreen({ route, navigation }) {
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (!selectedVideo) {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') StatusBar.setBackgroundColor('#e74c3c');
    }
  }, [selectedVideo]);

  useEffect(() => {
    if (route?.params?.autoPlay) {
      const autoVideo =
        VIDEOS.find(v => v.videoUrl === route.params.autoPlay.videoUrl) ||
        route.params.autoPlay;
      setSelectedVideo(autoVideo);
    }
  }, [route?.params?.autoPlay]);

  if (selectedVideo) {
    return <VideoPlayer selectedVideo={selectedVideo} onClose={() => setSelectedVideo(null)} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <Ionicons name="play-circle" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>First Aid Videos</Text>
            <Text style={styles.headerSub}>{VIDEOS.length} videos available</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerCloseBtn}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── SECTION LABEL ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>📹 Learn First Aid with Videos</Text>
          <Text style={styles.sectionSub}>Tap any video to start watching</Text>
        </View>

        {/* ── VIDEO LIST ── */}
        {VIDEOS.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={styles.videoCard}
            onPress={() => setSelectedVideo(video)}
            activeOpacity={0.82}
          >
            <View style={[styles.thumbnail, { backgroundColor: CATEGORY_COLORS[video.category] || '#e74c3c' }]}>
              <Ionicons name="play-circle" size={36} color="rgba(255,255,255,0.9)" />
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={10} color="#fff" />
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={[styles.catTag, { backgroundColor: (CATEGORY_COLORS[video.category] || '#e74c3c') + '18' }]}>
                <Text style={[styles.catTagText, { color: CATEGORY_COLORS[video.category] || '#e74c3c' }]}>
                  {video.category.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{video.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{video.description}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#ddd" />
          </TouchableOpacity>
        ))}

        {/* ── TIP ── */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={20} color="#f39c12" />
          </View>
          <Text style={styles.tipText}>
            Watch these videos <Text style={{ fontWeight: '700', color: '#856404' }}>before an emergency</Text> so you'll be prepared when it matters most.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── List Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  list:      { paddingBottom: 8 },

  header:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e74c3c', paddingHorizontal: 14, paddingVertical: 16, paddingTop: 55, paddingBottom: 10, gap: 12 },
  headerIconBox:   { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  headerSub:       { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerCloseBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  sectionRow:  { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  sectionSub:  { fontSize: 12, color: '#aaa', marginTop: 3 },

  videoCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, marginHorizontal: 16, marginBottom: 10,
    elevation: 2, alignItems: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  thumbnail: {
    width: 100, height: 82,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  durationBadge: {
    position: 'absolute', bottom: 6, right: 6,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
  },
  durationText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  cardContent:  { flex: 1, padding: 12, paddingRight: 6 },
  catTag: {
    alignSelf: 'flex-start', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6, marginBottom: 5,
  },
  catTagText: { fontSize: 10, fontWeight: '800' },
  cardTitle:  { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 4, lineHeight: 18 },
  cardDesc:   { fontSize: 11, color: '#999', lineHeight: 16 },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fffbf0', margin: 16, borderRadius: 14,
    padding: 16, gap: 12, borderLeftWidth: 4, borderLeftColor: '#f39c12',
  },
  tipIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef9e7', justifyContent: 'center', alignItems: 'center' },
  tipText: { flex: 1, fontSize: 13, color: '#856404', lineHeight: 20 },
});