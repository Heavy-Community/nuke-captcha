import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Accelerometer } from "expo-sensors";
import Svg, { Path, Circle } from "react-native-svg";

export default function App() {
  const [recording, setRecording] = useState(false);
  const [motionData, setMotionData] = useState([]);
  const [patternDetected, setPatternDetected] = useState(false);
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
    backgroundColor: "#fff",
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
});
