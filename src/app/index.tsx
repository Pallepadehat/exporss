import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const fetchExpoBlogRSS = async () => {
  const response = await fetch("/api/rss");
  if (!response.ok) throw new Error("API route failed to load");
  const payload = await response.json();

  console.log("=== RSS Feed via Server API ===");
  console.log("Title:", payload.title);
  console.log("Total Items:", payload.items.length);

  if (payload.items.length > 0) {
    console.log("--- First Item ---");
    console.log("Title:", payload.items[0].title);
    console.log("Author:", payload.items[0].author);
    console.log("Image URL:", payload.items[0].thumbnailUrl);
  }
  return payload;
};

export default function Index() {
  useEffect(() => {
    fetchExpoBlogRSS()
      .then(() => {
        console.log("RSS feed fetch request complete!");
      })
      .catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <Text>RSS Parser: Check terminal output!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
