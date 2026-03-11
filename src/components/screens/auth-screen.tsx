import { DB } from "@/utils/db";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const [sentEmail, setSentEmail] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) return;
    setLoading(true);
    try {
      setSentEmail(email);
      await DB.auth.sendMagicCode({ email });
    } catch (err: any) {
      Alert.alert("Uh oh", err.body?.message || "An error occurred");
      setSentEmail("");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    setLoading(true);
    try {
      await DB.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err: any) {
      Alert.alert("Uh oh", err.body?.message || "Invalid code");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons
              name="newspaper"
              size={48}
              color="#ff2d55"
              style={styles.logo}
            />
            <Text style={styles.title}>
              {!sentEmail ? "Welcome to News+" : "Check your email"}
            </Text>
            <Text style={styles.subtitle}>
              {!sentEmail
                ? "Enter your email address to continue."
                : `We've sent a magic code to\n${sentEmail}`}
            </Text>
          </View>

          <View style={styles.form}>
            {!sentEmail ? (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#8e8e93"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#8e8e93"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="keypad-outline"
                  size={20}
                  color="#8e8e93"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor="#8e8e93"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  maxLength={6}
                />
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={!sentEmail ? handleSendCode : handleVerifyCode}
              disabled={loading || (!sentEmail ? !email : !code)}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "Please wait..."
                  : !sentEmail
                    ? "Continue"
                    : "Verify Code"}
              </Text>
            </Pressable>

            {sentEmail ? (
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={() => {
                  setSentEmail("");
                  setCode("");
                }}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Wrong email? Go back</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 44,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#8e8e93",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
    height: "100%",
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#007aff",
    fontSize: 15,
    fontWeight: "500",
  },
});
