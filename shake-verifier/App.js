import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";
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
  const [sensorData, setSensorData] = useState({
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    magnetometer: { x: 0, y: 0, z: 0 },
  });

  // Sensor subscriptions
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    let accelSubscription;
    let gyroSubscription;
    let magSubscription;

    if (recording) {
      // Set up accelerometer
      accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
        setSensorData((prev) => ({
          ...prev,
          accelerometer: { x, y, z },
        }));
      });

      // Set up gyroscope
      gyroSubscription = Gyroscope.addListener(({ x, y, z }) => {
        setSensorData((prev) => ({
          ...prev,
          gyroscope: { x, y, z },
        }));
      });

      // Set up magnetometer
      magSubscription = Magnetometer.addListener(({ x, y, z }) => {
        setSensorData((prev) => ({
          ...prev,
          magnetometer: { x, y, z },
        }));
      });

      // Set update intervals
      Accelerometer.setUpdateInterval(16); // ~60fps
      Gyroscope.setUpdateInterval(16);
      Magnetometer.setUpdateInterval(16);

      setSubscriptions([accelSubscription, gyroSubscription, magSubscription]);
    }

    return () => {
      subscriptions.forEach((sub) => sub && sub.remove());
    };
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

  // Analyze motion with more sophisticated pattern recognition
  const analyzeMotion = () => {
    if (motionData.length < 10) return;

    // Calculate motion characteristics
    const motionCharacteristics = calculateMotionCharacteristics(motionData);

    // Check for human-like motion patterns
    const isHumanLike = validateHumanMotion(motionCharacteristics);

    // Check for infinity pattern
    const isInfinityPattern = detectInfinityPattern(motionData);

    if (isHumanLike && isInfinityPattern) {
      setPatternDetected(true);
    }
  };

  // Calculate motion characteristics
  const calculateMotionCharacteristics = (data) => {
    const characteristics = {
      smoothness: calculateSmoothness(data),
      acceleration: calculateAcceleration(data),
      microTremors: detectMicroTremors(data),
      timing: analyzeTiming(data),
    };
    return characteristics;
  };

  // Validate human-like motion
  const validateHumanMotion = (characteristics) => {
    // Check for natural motion patterns
    const hasNaturalSmoothness = characteristics.smoothness > 0.7;
    const hasNaturalAcceleration = characteristics.acceleration > 0.6;
    const hasMicroTremors = characteristics.microTremors > 0.5;
    const hasNaturalTiming = characteristics.timing > 0.8;

    return (
      hasNaturalSmoothness &&
      hasNaturalAcceleration &&
      hasMicroTremors &&
      hasNaturalTiming
    );
  };

  // Detect infinity pattern
  const detectInfinityPattern = (data) => {
    // Implement more sophisticated pattern detection
    const leftMoves = data.filter((p) => p.x < -0.3).length;
    const rightMoves = data.filter((p) => p.x > 0.3).length;
    const upMoves = data.filter((p) => p.y < -0.3).length;
    const downMoves = data.filter((p) => p.y > 0.3).length;

    // Check for symmetry in the pattern
    const isSymmetric =
      Math.abs(leftMoves - rightMoves) < 2 && Math.abs(upMoves - downMoves) < 2;

    return (
      leftMoves > 2 &&
      rightMoves > 2 &&
      upMoves > 2 &&
      downMoves > 2 &&
      isSymmetric
    );
  };

  // Helper functions for motion analysis
  const calculateSmoothness = (data) => {
    if (data.length < 3) return 0;

    // Calculate the rate of change between consecutive points
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      const dx = data[i].x - data[i - 1].x;
      const dy = data[i].y - data[i - 1].y;
      changes.push(Math.sqrt(dx * dx + dy * dy));
    }

    // Calculate the variance of changes
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance =
      changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;

    // Convert variance to smoothness score (0 to 1)
    // Lower variance = smoother motion
    const maxExpectedVariance = 0.5; // Adjust this threshold based on testing
    const smoothness = Math.max(0, 1 - variance / maxExpectedVariance);

    return smoothness;
  };

  const calculateAcceleration = (data) => {
    if (data.length < 3) return 0;

    // Calculate acceleration between points
    const accelerations = [];
    for (let i = 2; i < data.length; i++) {
      const dx1 = data[i - 1].x - data[i - 2].x;
      const dy1 = data[i - 1].y - data[i - 2].y;
      const dx2 = data[i].x - data[i - 1].x;
      const dy2 = data[i].y - data[i - 1].y;

      const accelX = dx2 - dx1;
      const accelY = dy2 - dy1;
      accelerations.push(Math.sqrt(accelX * accelX + accelY * accelY));
    }

    // Analyze acceleration patterns
    const meanAccel =
      accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    const maxAccel = Math.max(...accelerations);

    // Check for natural acceleration patterns
    // Human motion typically has gradual acceleration changes
    const accelerationScore = Math.min(1, meanAccel / maxAccel);

    return accelerationScore;
  };

  const detectMicroTremors = (data) => {
    // Placeholder for now - will implement in next phase
    return 0.6;
  };

  const analyzeTiming = (data) => {
    // Placeholder for now - will implement in next phase
    return 0.9;
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
      <Text style={styles.title}>Drawwwww an ∞ with your phone</Text>
      <Text style={styles.title}>KUr</Text>
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
