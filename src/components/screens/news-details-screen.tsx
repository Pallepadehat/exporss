import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Markdown, { Renderer } from "react-native-marked";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Custom renderer: overrides code block for proper dark-theme display ───────

class DarkCodeRenderer extends Renderer {
  code(text: string, _language?: string): React.ReactNode {
    return (
      <RNScrollView
        key={Math.random().toString()}
        horizontal
        contentContainerStyle={codeBlockStyle.container}
      >
        <View>
          <Text style={codeBlockStyle.text}>{text}</Text>
        </View>
      </RNScrollView>
    );
  }
}

const codeBlockStyle = StyleSheet.create({
  container: {
    backgroundColor: "#0d1117",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#30363d",
    minWidth: "100%",
  },
  text: {
    fontFamily: "Courier",
    fontSize: 13.5,
    color: "#e6edf3",
    lineHeight: 22,
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

type ArticleData = {
  title: string;
  description: string | null;
  image: string | null;
  markdown: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    link?: string;
    thumbnailUrl?: string;
    title?: string;
    author?: string;
    description?: string;
    publishDate?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.link) {
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/article?url=${encodeURIComponent(params.link!)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setArticle(data);
      } catch (e: any) {
        setError(e.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.link]);

  const heroImage = article?.image || params.thumbnailUrl || null;

  const publishLabel = params.publishDate
    ? new Date(params.publishDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 10), zIndex: 10 },
        ]}
      >
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {params.author || "Expo Blog"}
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        {heroImage && (
          <Link.AppleZoomTarget>
            <Image
              source={{ uri: heroImage }}
              style={{ width: "100%", height: width * 0.56 }}
              contentFit="cover"
            />
          </Link.AppleZoomTarget>
        )}

        <View style={styles.articleContent}>
          {/* Title */}
          <Text style={styles.title}>{article?.title || params.title}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{params.author || "Expo Team"}</Text>
            {publishLabel && (
              <>
                <Text style={styles.metaDot}> · </Text>
                <Text style={styles.metaText}>{publishLabel}</Text>
              </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* ── Content ─────────────────────────────────────────────── */}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0a7cff" />
              <Text style={styles.loadingText}>Loading full article…</Text>
            </View>
          )}

          {error && !loading && (
            <>
              <Text style={styles.errorText}>
                ⚠️ Could not load full article — showing preview only.
              </Text>
              {params.description ? (
                <Text style={styles.fallbackBody}>
                  {params.description.replace(/<[^>]+>/g, "")}
                </Text>
              ) : null}
            </>
          )}

          {!loading && !error && article?.markdown && (
            <MarkdownContent markdown={article.markdown} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── MarkdownContent: memoises the renderer instance so it's stable ────────────

function MarkdownContent({ markdown }: { markdown: string }) {
  const rendererRef = useRef(new DarkCodeRenderer());
  return (
    <Markdown
      value={markdown}
      flatListProps={{ scrollEnabled: false }}
      renderer={rendererRef.current}
      styles={markdownStyles}
      theme={{
        colors: {
          background: "#ffffff",
          code: "#0d1117",
          link: "#0a7cff",
          text: "#222222",
          border: "#e0e0e0",
        },
      }}
    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ── Header
  header: {
    backgroundColor: "#151515",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: { flex: 1, alignItems: "flex-start" },
  headerRight: { flex: 1 },
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
    fontSize: 20,
    fontWeight: "900",
    fontFamily: "Georgia",
    flex: 2,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  // ── Layout
  scrollContent: { paddingBottom: 80 },
  articleContent: { padding: 22, paddingTop: 28 },

  // ── Title / meta
  title: {
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "Georgia",
    color: "#1a1a1a",
    lineHeight: 38,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metaText: { fontSize: 13, color: "#999", fontWeight: "500" },
  metaDot: { fontSize: 13, color: "#ccc" },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 24,
  },

  // ── Loading / error
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 14,
  },
  loadingText: { fontSize: 14, color: "#bbb" },
  errorText: {
    fontSize: 14,
    color: "#e44",
    marginBottom: 16,
    fontStyle: "italic",
  },
  fallbackBody: {
    fontSize: 18,
    fontFamily: "Georgia",
    color: "#222",
    lineHeight: 29,
  },
});

// ── Markdown styles (MarkedStyles shape) ─────────────────────────────────────

const markdownStyles = StyleSheet.create({
  // Body text
  text: {
    fontSize: 18,
    fontFamily: "Georgia",
    color: "#222",
    lineHeight: 29,
  },
  paragraph: {
    marginBottom: 18,
  },

  // Headings
  h1: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1a1a1a",
    fontFamily: "Georgia",
    lineHeight: 38,
    marginTop: 32,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    fontFamily: "Georgia",
    lineHeight: 32,
    marginTop: 30,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    fontFamily: "Georgia",
    lineHeight: 28,
    marginTop: 24,
    marginBottom: 8,
  },
  h4: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 6,
  },

  // ── Code block (fenced)
  code: {
    backgroundColor: "#0d1117",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#30363d",
  },

  // ── Inline code
  codespan: {
    fontFamily: "Courier",
    fontSize: 15,
    color: "#cf222e",
    backgroundColor: "#f6f8fa",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // ── Blockquote
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#0a7cff",
    backgroundColor: "#f0f6ff",
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginVertical: 16,
  },

  // ── Lists
  list: {
    marginBottom: 16,
  },
  li: {
    fontSize: 18,
    fontFamily: "Georgia",
    color: "#222",
    lineHeight: 29,
  },

  // ── Horizontal rule
  hr: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 24,
  },

  // ── Links
  link: {
    color: "#0a7cff",
    textDecorationLine: "underline",
  },

  // ── Images
  image: {
    borderRadius: 10,
    marginVertical: 16,
  },

  // ── Strong / em
  strong: { fontWeight: "700" },
  em: { fontStyle: "italic" },
  strikethrough: { textDecorationLine: "line-through" },

  // ── Table
  table: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginVertical: 16,
    overflow: "hidden",
  },
  tableRow: {
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableCell: {
    padding: 10,
  },
});
