import FeedScreen from "@/components/screens/feed-screen";
import { StyleSheet } from "react-native";

export default function Index() {
  return <FeedScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
