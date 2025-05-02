import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import Svg, { Path, Circle } from "react-native-svg";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";

export default function App() {
  const [recording, setRecording] = useState(false);
  const [motionData, setMotionData] = useState([]);
  const [patternDetected, setPatternDetected] = useState(false);
  const [userId, setUserId] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pathRef = useRef("");

  useEffect(() => {
    let subscription;
    if (recording) {
      subscription = Accelerometer.addListener(({ x, y }) => {
        setMotionData((current) => [...current, { x, y }]);
      });
      Accelerometer.setUpdateInterval(100);
    } else if (subscription) {
      subscription.remove();
    }
    return () => subscription && subscription.remove();
  }, [recording]);

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          try {
            const parsed = Linking.parse(url);
            setUserId(parsed.queryParams.userId);
          } catch (e) {
            setLinkError(e.message);
          }
        }
      })
      .catch((e) => setLinkError(e.message));
  }, []);

  useEffect(() => {
    if (patternDetected) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      fadeAnim.setValue(0);
    }
  }, [patternDetected]);

  const analyzeMotion = () => {
    if (motionData.length < 10) return;
    const leftMoves = motionData.filter((p) => p.x < -0.5).length;
    const rightMoves = motionData.filter((p) => p.x > 0.5).length;
    const upMoves = motionData.filter((p) => p.y < -0.5).length;
    const downMoves = motionData.filter((p) => p.y > 0.5).length;
    if (leftMoves > 5 && rightMoves > 5 && upMoves > 5 && downMoves > 5) {
      setPatternDetected(true);
    }
  };

  const handleStart = () => {
    Haptics.selectionAsync();
    setRecording(true);
    setPatternDetected(false);
    setMotionData([]);
    setTimeout(() => {
      setRecording(false);
      analyzeMotion();
    }, 5000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Draw an ∞ with your phone</Text>
      {userId && <Text style={styles.userId}>User ID: {userId}</Text>}
      {linkError && (
        <Text style={{ color: "red" }}>Link error: {linkError}</Text>
      )}
      <View style={styles.card}>
        <Svg height="100" width="200" style={styles.guide}>
          <Path
            d="M20,50 C20,10 80,10 80,50 C80,90 20,90 20,50 M80,50 C80,10 140,10 140,50 C140,90 80,90 80,50"
            stroke="#aaa"
            strokeWidth="2"
            fill="none"
          />
          <Circle cx="20" cy="50" r="4" fill="green" />
        </Svg>
        <TouchableOpacity
          style={[styles.button, recording && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={recording}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {recording ? "Recording..." : "Start Motion"}
          </Text>
        </TouchableOpacity>
        {patternDetected && (
          <Animated.View style={[styles.result, { opacity: fadeAnim }]}>
            <Text style={styles.success}>✅ Infinity motion detected!</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: "#222",
    letterSpacing: 0.5,
  },
  userId: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
    width: 320,
    maxWidth: "100%",
  },
  guide: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 10,
    marginTop: 10,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  result: {
    marginTop: 24,
  },
  success: {
    fontSize: 20,
    color: "green",
    fontWeight: "600",
    textAlign: "center",
  },
});
