import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../ui/header";
import NewsCard from "../ui/news-card";

const fetchExpoBlogRSS = async () => {
  const response = await fetch("/api/rss");
  if (!response.ok) throw new Error("API route failed to load");
  const payload = await response.json();
  return payload;
};

export default function FeedScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      setRefreshing(true);
      const payload = await fetchExpoBlogRSS();
      if (payload && payload.items) {
        setItems(payload.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const onRefresh = useCallback(() => {
    loadFeed();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <NewsCard
            id={item.id}
            title={item.title}
            link={item.link}
            publishDate={item.publishDate}
            description={item.description}
            author={item.author}
            thumbnailUrl={item.thumbnailUrl}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Header
              title="FOR YOU IN NEWS+"
              description="NEWS+ RECOMMENDATIONS BASED ON WHAT YOU READ."
            />
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
});
