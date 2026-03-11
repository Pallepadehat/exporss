import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NewDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    thumbnailUrl?: string;
    title?: string;
    author?: string;
    description?: string;
    publishDate?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Clean description text (strip basic HTML tags if any)
  const cleanDescription = params.description
    ? params.description.replace(/<[^>]+>/g, "")
    : "No description available.";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sticky Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10), zIndex: 10 }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {params.author || "Expo Team"}
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {params.thumbnailUrl && (
          <Link.AppleZoomTarget>
            <Image
              source={{ uri: params.thumbnailUrl }}
              style={{ width: "100%", height: width * 0.55 }}
              contentFit="cover"
            />
          </Link.AppleZoomTarget>
        )}

        <View style={styles.articleContent}>
          <Text style={styles.title}>{params.title}</Text>

          <Text style={styles.metaText}>
            by {params.author || "Max Olson"}{" "}
            {params.publishDate
              ? `· ${new Date(params.publishDate).toLocaleDateString()}`
              : "Oct 26, 2023 3:02 AM"}
          </Text>

          {/* Render description passed from params */}
          <Text style={styles.paragraph}>{cleanDescription}</Text>

          <Text style={styles.paragraph}>
            The video evidence of Michigan's signal-stealing efforts was shared
            nonstop on Tuesday, surpassing 17 million views within 36 hours.
          </Text>

          <Text style={styles.paragraph}>
            The footage, posted by Ohio TV reporter Adam King, shows{" "}
            <Text style={styles.link}>Michigan</Text> analyst{" "}
            <Text style={styles.link}>Connor Stalions</Text> and how carefully
            this design maps out the details. To understand how not to{" "}
            <Text style={{ fontStyle: "italic" }}>'get got.'</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#151515",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerRight: {
    flex: 1,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    fontFamily: "Georgia",
    flex: 2,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  articleContent: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    fontFamily: "Georgia",
    color: "#1a1a1a",
    lineHeight: 40,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  metaText: {
    fontSize: 13,
    color: "#a0a0a0",
    marginBottom: 32,
    fontWeight: "500",
  },
  paragraph: {
    fontSize: 19,
    fontFamily: "Georgia",
    color: "#222",
    lineHeight: 30,
    marginBottom: 24,
  },
  link: {
    color: "#0066cc",
  },
});
