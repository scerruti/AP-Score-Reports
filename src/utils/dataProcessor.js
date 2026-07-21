export function processFormSections(sections) {
  if (!sections || sections.length === 0) {
    return [];
  }

  // Calculate ratios for each category in each form
  // Normalize means to 1-5 scale using question count: score = (points / questions) * 5
  const formsWithRatios = sections.map(section => ({
    ...section,
    categories: section.categories.map(cat => {
      if (cat.noData || !cat.questionCount) {
        return { ...cat, ratio: null, groupScore: null, globalScore: null };
      }
      // Convert points to 1-5 AP score scale
      const groupScore = (cat.groupMean / cat.questionCount) * 5;
      const globalScore = (cat.globalMean / cat.questionCount) * 5;
      const ratio = groupScore / globalScore;
      return { ...cat, ratio, groupScore, globalScore };
    }),
  }));

  // Group categories by name and weight them by student count
  const categoryMap = new Map();
  let totalQuestions = 0;

  formsWithRatios.forEach(form => {
    form.categories.forEach(cat => {
      const key = `${cat.categoryType}|${cat.categoryName}`;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          categoryType: cat.categoryType,
          categoryName: cat.categoryName,
          ratios: [],
          studentCounts: [],
          hasData: [],
          globalMeans: [],
          globalMeanWeights: [],
          questionCounts: [],
        });
      }

      const entry = categoryMap.get(key);

      // Track total questions (count each category only once, from first form)
      if (entry.questionCounts.length === 0 && cat.questionCount) {
        totalQuestions += cat.questionCount;
      }

      if (!cat.noData) {
        entry.ratios.push(cat.ratio);
        entry.studentCounts.push(form.studentCount);
        entry.hasData.push(true);
        entry.globalMeans.push(cat.globalMean);
        entry.globalMeanWeights.push(form.studentCount);
        if (cat.questionCount) {
          entry.questionCounts.push(cat.questionCount);
        }
      } else {
        entry.hasData.push(false);
        // For noData categories, still track the question count
        if (entry.questionCounts.length === 0 && cat.questionCount) {
          entry.questionCounts.push(cat.questionCount);
        }
      }
    });
  });

  // Calculate weighted averages
  const results = Array.from(categoryMap.values()).map(entry => {
    const dataAvailable = entry.hasData.some(h => h);

    if (!dataAvailable) {
      // No data for this category in any form
      const questionCount = entry.questionCounts.length > 0 ? entry.questionCounts[0] : 0;
      return {
        categoryType: entry.categoryType,
        categoryName: entry.categoryName,
        weightedRatio: null,
        normalizedScore: null,
        questionCount,
        questionPercentage: totalQuestions > 0 ? parseFloat(((questionCount / totalQuestions) * 100).toFixed(1)) : 0,
        formCount: entry.hasData.length,
        noData: true,
      };
    }

    // Weight each form's ratio by its student count (only for forms with data)
    let weightedRatioSum = 0;
    let totalWeight = 0;

    entry.ratios.forEach((ratio, idx) => {
      if (ratio !== null) {
        const weight = entry.studentCounts[idx];
        weightedRatioSum += ratio * weight;
        totalWeight += weight;
      }
    });

    const weightedRatio = totalWeight > 0 ? weightedRatioSum / totalWeight : null;

    // Calculate per-category average global mean (weighted by student count)
    let categoryGlobalMeanSum = 0;
    let categoryGlobalMeanWeight = 0;
    entry.globalMeans.forEach((gm, idx) => {
      categoryGlobalMeanSum += gm * entry.globalMeanWeights[idx];
      categoryGlobalMeanWeight += entry.globalMeanWeights[idx];
    });
    const categoryAverageGlobalMean = categoryGlobalMeanWeight > 0 ? categoryGlobalMeanSum / categoryGlobalMeanWeight : 3.0;

    // The normalized score is the weighted group score (already on 1-5 scale from the conversion above)
    // Calculate weighted group scores
    let weightedGroupScoreSum = 0;
    let groupScoreTotalWeight = 0;

    entry.ratios.forEach((ratio, idx) => {
      if (ratio !== null) {
        // Recalculate group score from the weighted ratio and global score
        // ratio = groupScore / globalScore, so groupScore = ratio * globalScore
        const weight = entry.studentCounts[idx];
        const globalScoreAtIdx = entry.globalMeans[idx] / entry.questionCounts[idx] * 5;
        const groupScoreAtIdx = ratio * globalScoreAtIdx;
        weightedGroupScoreSum += groupScoreAtIdx * weight;
        groupScoreTotalWeight += weight;
      }
    });

    const normalizedScore = groupScoreTotalWeight > 0 ? parseFloat((weightedGroupScoreSum / groupScoreTotalWeight).toFixed(2)) : null;

    // Calculate question percentage
    const questionCount = entry.questionCounts.length > 0 ? entry.questionCounts[0] : 0;
    const questionPercentage = totalQuestions > 0 ? parseFloat(((questionCount / totalQuestions) * 100).toFixed(1)) : 0;

    return {
      categoryType: entry.categoryType,
      categoryName: entry.categoryName,
      weightedRatio: weightedRatio !== null ? parseFloat(weightedRatio.toFixed(3)) : null,
      normalizedScore,
      questionCount,
      questionPercentage,
      formCount: entry.ratios.length,
      noData: false,
    };
  });

  // Sort by category type and then by name
  results.sort((a, b) => {
    if (a.categoryType !== b.categoryType) {
      return a.categoryType.localeCompare(b.categoryType);
    }
    return a.categoryName.localeCompare(b.categoryName);
  });

  // Calculate breakdown by category type (pie chart for each type)
  const categoryTypeBreakdowns = {};

  results.forEach(row => {
    if (!categoryTypeBreakdowns[row.categoryType]) {
      categoryTypeBreakdowns[row.categoryType] = [];
    }
    categoryTypeBreakdowns[row.categoryType].push({
      categoryName: row.categoryName,
      questionCount: row.questionCount,
    });
  });

  // Calculate percentages within each category type
  const categoryTypeCharts = Object.entries(categoryTypeBreakdowns).map(([type, categories]) => {
    const typeTotal = categories.reduce((sum, cat) => sum + (cat.questionCount || 0), 0);
    return {
      type,
      data: categories.map(cat => ({
        name: cat.categoryName,
        questionCount: cat.questionCount,
        percentage: typeTotal > 0 ? parseFloat(((cat.questionCount / typeTotal) * 100).toFixed(1)) : 0,
      })),
    };
  });

  return { results, categoryTypeCharts };
}
