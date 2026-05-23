import type { AIMetrics } from "@/lib/types";

/**
 * WritingAnalysisService — decision-support only.
 * Computes linguistic metrics for teacher review.
 * Does NOT auto-grade.
 */
export function analyzeWriting(text: string): AIMetrics {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      repetitionIndex: 0,
      readabilityScore: 0,
      consistencyScore: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Sentence splitting: split on ., !, ? followed by space or end
  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const sentenceCount = Math.max(sentences.length, 1);

  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

  // Repetition index: ratio of repeated words to total words
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
  const uniqueWords = new Set(lowerWords);
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can",
    "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "and",
    "but", "or", "nor", "not", "so", "yet", "both", "either",
    "neither", "each", "every", "all", "any", "few", "more",
    "most", "other", "some", "such", "no", "only", "own", "same",
    "than", "too", "very", "just", "because", "it", "its", "this",
    "that", "these", "those", "i", "me", "my", "we", "our", "you",
    "your", "he", "him", "his", "she", "her", "they", "them", "their",
  ]);
  const contentWords = lowerWords.filter((w) => !stopWords.has(w) && w.length > 0);
  const uniqueContentWords = new Set(contentWords);
  const repetitionIndex =
    contentWords.length > 0
      ? Math.round(
          (1 - uniqueContentWords.size / contentWords.length) * 100
        ) / 100
      : 0;

  // Readability score (simplified Flesch-like: 0–100)
  const syllableCount = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
  const rawReadability =
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  const readabilityScore = Math.round(Math.max(0, Math.min(100, rawReadability)));

  // Consistency score: measures uniformity of sentence lengths
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const meanLen =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance =
    sentenceLengths.reduce((acc, len) => acc + Math.pow(len - meanLen, 2), 0) /
    sentenceLengths.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = meanLen > 0 ? stdDev / meanLen : 0;
  // Lower CV = more consistent; map to 0–100 score
  const consistencyScore = Math.round(
    Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100))
  );

  return {
    wordCount,
    sentenceCount,
    avgSentenceLength,
    repetitionIndex,
    readabilityScore,
    consistencyScore,
  };
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const vowelGroups = w.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  if (w.endsWith("e") && !w.endsWith("le")) count -= 1;
  return Math.max(count, 1);
}

/**
 * Returns simplified feedback for students (no raw metrics).
 */
export function getStudentFeedback(metrics: AIMetrics): string[] {
  const feedback: string[] = [];

  if (metrics.readabilityScore >= 70) {
    feedback.push("Your writing is clear and easy to follow.");
  } else if (metrics.readabilityScore >= 40) {
    feedback.push(
      "Consider simplifying some sentences to improve readability."
    );
  } else {
    feedback.push(
      "Your writing may benefit from shorter sentences and simpler vocabulary."
    );
  }

  if (metrics.consistencyScore >= 70) {
    feedback.push("Your writing maintains a consistent style throughout.");
  } else {
    feedback.push(
      "Try to maintain a more consistent sentence structure across your work."
    );
  }

  if (metrics.repetitionIndex > 0.3) {
    feedback.push(
      "Consider using more varied vocabulary to strengthen your argument."
    );
  }

  if (metrics.wordCount < 100) {
    feedback.push("Your response could benefit from more detailed elaboration.");
  }

  return feedback;
}
