import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NewsCardProps = {
  id: string;
  title: string;
  link: string;
  publishDate: string;
  description: string;
  author: string;
  thumbnailUrl: string;
};

export default function NewsCard({
  id,
  title,
  link,
  publishDate,
  description,
  author,
  thumbnailUrl,
}: NewsCardProps) {
  return (
    <Link
      href={
        {
          pathname: "/news/[id]",
          params: { id, thumbnailUrl, title, author, publishDate, description },
        } as any
      }
      asChild
    >
      <Pressable style={styles.cardContainer}>
        <Link.AppleZoom>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.image}
            contentFit="cover"
          />
        </Link.AppleZoom>
        <View style={styles.contentContainer}>
          <Text style={styles.newsPlusText}>
            <Text style={{ fontWeight: "900" }}>News+</Text>
          </Text>
          <Text style={styles.publisherText}>{author || "Publisher"}</Text>
          <Text style={styles.titleText} numberOfLines={4}>
            {title}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#f2f2f2",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  image: {
    width: "100%",
    height: 240,
  },
  contentContainer: {
    padding: 18,
    paddingTop: 16,
  },
  newsPlusText: {
    color: "#ff2d55",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  publisherText: {
    color: "#00aae6",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  ellipsisIcon: {
    color: "#999",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
    lineHeight: 24,
  },
});
