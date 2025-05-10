import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
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
  const [modalVisible, setModalVisible] = useState(false);
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
      setModalVisible(true);
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

    if (leftMoves <= rightMoves && leftMoves < 3)
      return "↩️ Move your phone LEFT";
    if (rightMoves <= upMoves && rightMoves < 3) return "↪️ Now move RIGHT";
    if (upMoves <= downMoves && upMoves < 3) return "⬆️ Now move UP";
    if (downMoves < 3) return "⬇️ Now move DOWN to complete the loop";

    return "✨ Almost done — complete the ∞ motion!";
  };

  // Convert motion to infinity path-following visual space (more guided feel)
  const getVisualPosition = () => {
    if (!motionData.length) return { cx: 20, cy: 50 };
    const { x, y } = motionData[motionData.length - 1];
    const scaledX = 100 + x * 60; // re-center and stretch for visual feedback
    const scaledY = 50 - y * 60;
    return { cx: scaledX, cy: scaledY };
  };

  const { cx, cy } = getVisualPosition();

  return (
    <View style={styles.container}>
      {/* Modal for success message */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Damn, you are 100% human!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text style={styles.title}>Draw an ∞ with your phone</Text>
      <Text style={styles.guidance}>{getGuidanceMessage()}</Text>
      <Svg height="100" width="200" style={styles.guide}>
        <Path
          d="M20,50 C20,10 80,10 80,50 C80,90 20,90 20,50 M80,50 C80,10 140,10 140,50 C140,90 80,90 80,50"
          stroke="#aaa"
          strokeWidth="2"
          fill="none"
        />
        <Circle cx={cx} cy={cy} r="4" fill="red" />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
