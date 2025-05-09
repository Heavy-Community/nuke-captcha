import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Button, Text } from "react-native";
import { Accelerometer } from "expo-sensors";
import Svg, { Path, Circle } from "react-native-svg";

interface MotionData {
  x: number;
  y: number;
}

export default function HomeScreen() {
  const [recording, setRecording] = useState(false);
  const [motionData, setMotionData] = useState<MotionData[]>([]);
  const [patternDetected, setPatternDetected] = useState(false);
  const pathRef = useRef("");

  useEffect(() => {
    let subscription: { remove: () => void } | undefined;
    if (recording) {
      subscription = Accelerometer.addListener(({ x, y }) => {
        setMotionData((current) => [...current, { x, y }]);
      });
      Accelerometer.setUpdateInterval(100);
    } else if (subscription) {
      subscription.remove();
    }
    return () => subscription?.remove();
  }, [recording]);

  const calculateSmoothness = (data: MotionData[]) => {
    if (data.length < 3) return 0;
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      const dx = data[i].x - data[i - 1].x;
      const dy = data[i].y - data[i - 1].y;
      changes.push(Math.sqrt(dx * dx + dy * dy));
    }
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance =
      changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;
    const maxExpectedVariance = 0.5;
    return Math.max(0, 1 - variance / maxExpectedVariance);
  };

  const calculateAcceleration = (data: MotionData[]) => {
    if (data.length < 3) return 0;
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
    const meanAccel =
      accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    const maxAccel = Math.max(...accelerations);
    return Math.min(1, meanAccel / (maxAccel || 1));
  };

  const analyzeMotion = () => {
    if (motionData.length < 8) return;

    const leftMoves = motionData.filter((p) => p.x < -0.4).length;
    const rightMoves = motionData.filter((p) => p.x > 0.4).length;
    const upMoves = motionData.filter((p) => p.y < -0.4).length;
    const downMoves = motionData.filter((p) => p.y > 0.4).length;

    const smoothness = calculateSmoothness(motionData);
    const acceleration = calculateAcceleration(motionData);

    if (
      leftMoves > 2 &&
      rightMoves > 2 &&
      upMoves > 2 &&
      downMoves > 2 &&
      smoothness > 0.4 &&
      acceleration > 0.4
    ) {
      setPatternDetected(true);
    }
  };

  const handleStart = () => {
    setRecording(true);
    setPatternDetected(false);
    setMotionData([]);
    setTimeout(() => {
      setRecording(false);
      analyzeMotion();
    }, 5000);
  };

  const getGuidanceMessage = () => {
    if (!recording)
      return "Hold your phone upright, screen facing you. Press Start and draw an ∞ shape.";
    const leftMoves = motionData.filter((p) => p.x < -0.4).length;
    const rightMoves = motionData.filter((p) => p.x > 0.4).length;
    const upMoves = motionData.filter((p) => p.y < -0.4).length;
    const downMoves = motionData.filter((p) => p.y > 0.4).length;
    if (leftMoves < 3)
      return `Step ${leftMoves + 1}: Move your phone to the LEFT`;
    if (rightMoves < 3)
      return `Step ${3 + rightMoves + 1}: Move your phone to the RIGHT`;
    if (upMoves < 3) return `Step ${6 + upMoves + 1}: Move your phone UP`;
    if (downMoves < 3) return `Step ${9 + downMoves + 1}: Move your phone DOWN`;
    return "Great! Keep going to complete the ∞ shape.";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Draw an ∞ index(tabs) PROVERKA with your phone
      </Text>
      <Text style={styles.guidance}>{getGuidanceMessage()}</Text>
      <Svg height="100" width="200" style={styles.guide}>
        <Path
          d="M20,50 C20,10 80,10 80,50 C80,90 20,90 20,50 M80,50 C80,10 140,10 140,50 C140,90 80,90 80,50"
          stroke="#aaa"
          strokeWidth="2"
          fill="none"
        />
        <Circle cx="20" cy="50" r="4" fill="green" />
      </Svg>
      <Button
        title={recording ? "Recording..." : "Start Motion"}
        onPress={handleStart}
        disabled={recording}
      />
      <Text style={styles.guidance}>{getGuidanceMessage()}</Text>
      {patternDetected && (
        <View style={styles.result}>
          <Text style={styles.success}>✅ Infinity motion detected!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  guide: {
    marginBottom: 30,
  },
  result: {
    marginTop: 20,
  },
  success: {
    fontSize: 18,
    color: "green",
  },
  guidance: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
});
