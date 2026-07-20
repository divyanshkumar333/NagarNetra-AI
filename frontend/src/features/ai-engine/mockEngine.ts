import { AIProvider, Telemetry, Hotspot, CityHealth, Prediction, Recommendation, DecisionLogEntry } from "./types";

export const MockAIProvider: AIProvider = {
  name: "NagarNetra Core AI (Mock)",
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processTelemetry: async (_telemetry: Telemetry) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate mock hotspots
    const hotspots: Hotspot[] = [
      {
        id: "hs-1",
        location: [20, 30],
        severity: 85,
        type: "Congestion",
        description: "Severe bottleneck detected at Main Junction due to signal failure."
      },
      {
        id: "hs-2",
        location: [-40, -10],
        severity: 60,
        type: "Accident",
        description: "Minor collision in northbound lane."
      }
    ];

    // Mock City Health
    const health: CityHealth = {
      score: 78,
      factors: {
        congestion: 65,
        signalEfficiency: 82,
        emergencyResponse: 90,
        incidents: 75,
        weather: 100
      }
    };

    // Mock Predictions
    const predictions: Prediction[] = [
      {
        timeframeMinutes: 15,
        predictedCongestionSpread: ["Main Junction", "North Ave"],
        travelTimeIncreaseSeconds: 420,
        accidentImpact: "High probability of secondary collisions",
        emergencyResponseDelaysSeconds: 120,
        confidence: 88
      }
    ];

    // Mock Recommendations
    const recommendations: Recommendation[] = [
      {
        id: "rec-1",
        title: "Reroute Traffic & Increase Green Duration",
        category: "Traffic",
        detailedExplanation: "Current traffic volume at Main Junction exceeds capacity by 40%. Rerouting northbound traffic via East Ave and extending green signal duration by 15 seconds will alleviate the bottleneck within 20 minutes.",
        reasoning: {
          observation: "Vehicle count at Main Junction increased by 40% in the last 10 minutes.",
          analysis: "Current signal timing is insufficient for clearing the accumulated queue.",
          prediction: "If unmitigated, congestion will spread to North Ave in 15 minutes, increasing average travel time by 7 minutes.",
          expectedOutcome: "Traffic flow normalized, preventing secondary gridlock.",
          confidence: 92
        },
        confidence: 92,
        estimatedImpact: "Reduce congestion index by 25 points",
        affectedIntersections: ["Main Junction", "East Ave"],
        estimatedTimeSavedMinutes: 7,
        priority: "High",
        riskLevel: "Low",
        carbonReductionKg: 120,
        emergencyImpact: "Improves ambulance routing corridor by 2 mins."
      }
    ];

    return { hotspots, health, predictions, recommendations };
  },

  simulate: async (recommendation: Recommendation) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      recommendationId: recommendation.id,
      currentStateMetrics: {
        congestion: 85,
        travelTime: 24, // mins
        emissions: 450 // kg
      },
      predictedStateMetrics: {
        congestion: 60,
        travelTime: 17,
        emissions: 330
      },
      expectedImprovementPercentage: 28
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluateDecision: async (_log: DecisionLogEntry) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      previousSuccessRate: 94,
      averageImprovement: 28,
      recommendedAgain: true,
      operatorAcceptanceRate: 88
    };
  }
};
