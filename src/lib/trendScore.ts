import { YouTubeVideo } from "@/types/youtube";

export interface TrendScoreResult {
  score: number;
  grade: "S" | "A" | "B" | "C" | "D";
  breakdown: {
    viewsPerHour: number;
    likeRate: number;
    commentRate: number;
    recencyBonus: number;
  };
}

export function calculateTrendScore(video: YouTubeVideo): TrendScoreResult {
  const ageMs = Date.now() - new Date(video.publishedAt).getTime();
  const ageHours = Math.max(ageMs / 3600000, 0.5);

  const views = parseInt(video.viewCount) || 0;
  const likes = parseInt(video.likeCount) || 0;
  const comments = parseInt(video.commentCount) || 0;

  const viewsPerHour = views / ageHours;
  const likeRate = likes / Math.max(views, 1);
  const commentRate = comments / Math.max(views, 1);
  // 업로드 후 7일(168시간) 기준 지수 감쇠
  const recencyBonus = Math.exp(-ageHours / 168);

  const score =
    Math.log10(viewsPerHour + 1) * 35 +
    likeRate * 100 * 30 +
    commentRate * 100 * 25 +
    recencyBonus * 10;

  const rounded = Math.round(score * 10) / 10;
  const grade =
    rounded >= 80 ? "S" :
    rounded >= 60 ? "A" :
    rounded >= 40 ? "B" :
    rounded >= 20 ? "C" : "D";

  return {
    score: rounded,
    grade,
    breakdown: {
      viewsPerHour: Math.round(viewsPerHour),
      likeRate: Math.round(likeRate * 1000) / 10,
      commentRate: Math.round(commentRate * 1000) / 10,
      recencyBonus: Math.round(recencyBonus * 100),
    },
  };
}

// 배치에서 상대 점수 0-100으로 정규화
export function normalizeTrendScores(
  videos: (YouTubeVideo & { rawTrendScore: number })[]
): (YouTubeVideo & { trendScore: number; trendGrade: string })[] {
  const scores = videos.map((v) => v.rawTrendScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  return videos.map((v) => {
    const normalized = Math.round(((v.rawTrendScore - min) / range) * 100);
    const grade =
      normalized >= 80 ? "S" :
      normalized >= 60 ? "A" :
      normalized >= 40 ? "B" :
      normalized >= 20 ? "C" : "D";
    return { ...v, trendScore: normalized, trendGrade: grade };
  });
}

// 제목 패턴 분석
export function analyzeTitlePatterns(titles: string[]) {
  const total = titles.length;
  if (total === 0) return null;

  const hasNumber = titles.filter((t) => /\d/.test(t)).length;
  const hasEmoji = titles.filter((t) => /\p{Emoji_Presentation}/u.test(t)).length;
  const hasBracket = titles.filter((t) => /[\[\]()【】「」『』〔〕]/.test(t)).length;
  const hasQuestion = titles.filter((t) => /[?？]/.test(t)).length;
  const hasExclamation = titles.filter((t) => /[!！]/.test(t)).length;
  const avgLength = Math.round(titles.reduce((s, t) => s + t.length, 0) / total);

  // 상위 키워드 추출 (간단한 빈도 기반)
  const stopWords = new Set([
    "이", "그", "저", "것", "수", "있", "등", "더", "이", "에", "은", "는", "이", "가", "을", "를",
    "의", "와", "과", "도", "에서", "으로", "로", "한", "하", "the", "a", "an", "in", "of", "to",
    "and", "is", "for", "with", "on", "that", "are", "was", "be",
  ]);

  const wordFreq: Record<string, number> = {};
  titles.forEach((t) => {
    const words = t.match(/[\w가-힣]{2,}/g) || [];
    words.forEach((w) => {
      const lower = w.toLowerCase();
      if (!stopWords.has(lower)) {
        wordFreq[lower] = (wordFreq[lower] || 0) + 1;
      }
    });
  });

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count, pct: Math.round((count / total) * 100) }));

  return {
    total,
    avgLength,
    hasNumber: { count: hasNumber, pct: Math.round((hasNumber / total) * 100) },
    hasEmoji: { count: hasEmoji, pct: Math.round((hasEmoji / total) * 100) },
    hasBracket: { count: hasBracket, pct: Math.round((hasBracket / total) * 100) },
    hasQuestion: { count: hasQuestion, pct: Math.round((hasQuestion / total) * 100) },
    hasExclamation: { count: hasExclamation, pct: Math.round((hasExclamation / total) * 100) },
    topWords,
  };
}

// 댓글 키워드 추출 (AI 없이)
export function extractCommentKeywords(comments: string[]): { word: string; count: number }[] {
  const stopWords = new Set([
    "이", "그", "저", "것", "수", "있", "등", "더", "에", "은", "는", "가", "을", "를",
    "의", "와", "과", "도", "에서", "으로", "로", "한", "하", "너무", "정말", "진짜",
    "그냥", "이거", "저거", "그거", "ㅋ", "ㅎ", "ㄷ", "ㅠ", "ㅜ", "the", "a", "is", "in",
  ]);
  const freq: Record<string, number> = {};
  comments.forEach((c) => {
    const words = c.replace(/<[^>]+>/g, "").match(/[\w가-힣]{2,}/g) || [];
    words.forEach((w) => {
      const lower = w.toLowerCase();
      if (!stopWords.has(lower) && lower.length >= 2) {
        freq[lower] = (freq[lower] || 0) + 1;
      }
    });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

// 교육 서브 카테고리 분류
export const EDUCATION_SUBCATEGORIES: Record<string, string[]> = {
  "AI/머신러닝": ["AI", "인공지능", "머신러닝", "딥러닝", "GPT", "ChatGPT", "LLM", "생성AI", "클로드"],
  "프로그래밍": ["코딩", "프로그래밍", "파이썬", "Python", "JavaScript", "자바스크립트", "개발", "알고리즘", "코드"],
  "수학/과학": ["수학", "물리", "화학", "생물", "과학", "통계", "미적분", "기하학", "함수"],
  "언어학습": ["영어", "일본어", "중국어", "스페인어", "TOEIC", "TOEFL", "어학", "문법", "회화", "단어"],
  "입시/공부법": ["수능", "공부법", "학습법", "시험", "수험", "내신", "공부", "암기", "집중"],
  "자기계발": ["자기계발", "독서", "습관", "성공", "비즈니스", "취업", "면접", "동기부여", "목표"],
  "역사/인문": ["역사", "철학", "심리학", "경제학", "사회학", "문학", "세계사", "한국사"],
};

export function classifyEducationVideo(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();
  for (const [category, keywords] of Object.entries(EDUCATION_SUBCATEGORIES)) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  return "기타 교육";
}
