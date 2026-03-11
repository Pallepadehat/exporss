import { StyleSheet, Text, View } from "react-native";

type HeaderProps = {
  title: string;
  description?: string;
};

export default function Header({ title, description }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    flexDirection: "column",
    gap: 5,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 30,
    letterSpacing: 1.3,
  },
  description: {
    textAlign: "center",
    fontSize: 14,
    letterSpacing: 0.8,
    paddingHorizontal: 40,
    color: "#b3b5b5",
  },
});
