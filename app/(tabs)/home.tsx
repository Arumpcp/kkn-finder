import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#003D7A', dark: '#003D7A' }}
      headerImage={
        <Image
          source={require('../../assets/images/logoKKN.png')}
          style={styles.logoKKN}
          contentFit="contain"
        />
      }
    >

      {/* Greeting Section */}
      <ThemedView style={styles.greetingContainer}>
        <ThemedText type="title" style={styles.greeting}>
          {getCurrentGreeting()}! 👋
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Selamat datang di KKN Finder UGM
        </ThemedText>
      </ThemedView>

      {/* Student Info */}
      <ThemedView style={styles.infoCard}>
        <ThemedText type="subtitle" style={styles.infoTitle}>
          Apa itu KKN Finder?
        </ThemedText>
        <View style={styles.infoRow}>
          <ThemedText>
            Halo teman-teman UGM! KKN Finder adalah aplikasi yang memudahkan kamu
            memperoleh informasi terkait tim KKN PPM UGM yang tersedia. Melalui
            aplikasi ini, kamu dapat melihat daftar tim, wilayah pelaksanaan KKN,
            jumlah anggota yang masih dibutuhkan, bidang fokus, serta narahubung
            setiap tim.
          </ThemedText>

        </View>
      </ThemedView>

      {/* Menu Section */}
      <ThemedView style={styles.menuSection}>
        <ThemedText type="subtitle" style={styles.menuTitle}>
          Menu Utama
        </ThemedText>

        {/* Menu Peta Lokasi */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push('/(tabs)/lokasi')}
          activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
            <IconSymbol name="map" size={28} color="#003D7A" />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="defaultSemiBold" style={styles.menuCardTitle}>
              Peta Lokasi KKN
            </ThemedText>
            <ThemedText style={styles.menuCardSubtitle}>
              Lihat sebaran unit KKN di peta
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Menu List Lokasi */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push('/(tabs)/listlokasi')}
          activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
            <IconSymbol name="list.bullet" size={28} color="#FDB81E" />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="defaultSemiBold" style={styles.menuCardTitle}>
              Daftar Lokasi KKN
            </ThemedText>
            <ThemedText style={styles.menuCardSubtitle}>
              Cari & filter lokasi KKN
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </ThemedView>

      {/* Info Alert */}
      <ThemedView style={styles.alertCard}>
        <View style={styles.alertIcon}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={24}
            color="#FDB81E"
          />
        </View>
        <View style={styles.alertContent}>
          <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
            KKN-PPM Universitas Gadjah Mada Periode IV!
          </ThemedText>
          <ThemedText style={styles.alertText}>
            22 Desember 2025 hingga 5 Februari 2026
          </ThemedText>
        </View>
      </ThemedView>

      {/* Stats */}
      <ThemedView style={styles.statsSection}>
        <ThemedText type="subtitle" style={styles.statsTitle}>
          KKN - PPM UGM 2025
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statEmoji}>🗺️</ThemedText>
            <ThemedText type="title" style={styles.statValue}>
              15
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Total Unit
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statEmoji}>👥</ThemedText>
            <ThemedText type="title" style={styles.statValue}>
              300
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Mahasiswa
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statEmoji}>✅</ThemedText>
            <ThemedText type="title" style={styles.statValue}>
              15
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Tersedia
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Praktikum Pemrograman Geospasial
        </ThemedText>
        <ThemedText style={styles.footerText}>
          Perangkat Bergerak Lanjut
        </ThemedText>
        <ThemedText style={styles.footerSubtext}>
          © 2025 KKN-PPM Universitas Gadjah Mada
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  logoKKN: {
    height: 160,
    width: 160,
    alignSelf: 'center',
    marginTop: 35,
    backgroundColor: 'transparent',
  },
  greetingContainer: {
    gap: 8,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003D7A',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#003D7A',
    borderLeftWidth: 6,
    borderLeftColor: '#FDB81E',
  },
  infoTitle: {
    marginBottom: 4,
    color: '#003D7A',
    fontWeight: 'bold',
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  menuSection: {
    gap: 12,
    marginBottom: 20,
  },
  menuTitle: {
    marginBottom: 4,
    color: '#003D7A',
    fontWeight: 'bold',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    gap: 4,
  },
  menuCardTitle: {
    fontSize: 15,
    color: '#003D7A',
    fontWeight: 'bold',
  },
  menuCardSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#FDB81E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDB81E',
  },
  alertIcon: {
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 15,
    color: '#003D7A',
    fontWeight: 'bold',
  },
  alertText: {
    fontSize: 13,
    color: '#475569',
  },
  statsSection: {
    gap: 12,
    marginBottom: 20,
  },
  statsTitle: {
    marginBottom: 4,
    color: '#003D7A',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E0F2FE',
    borderTopWidth: 4,
    borderTopColor: '#003D7A',
  },
  statEmoji: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003D7A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '100%',
    flexShrink: 0,      // <-- WAJIB BIAR TIDAK DIPOTONG
  },

  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },

});
