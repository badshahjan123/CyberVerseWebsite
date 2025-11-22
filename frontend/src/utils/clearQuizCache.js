// Utility to clear quiz cache for testing
export const clearQuizCache = (roomId) => {
  localStorage.removeItem(`quiz_results_${roomId}`)
  console.log(`Cleared quiz cache for room: ${roomId}`)
}

export const clearAllQuizCache = () => {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('quiz_results_')) {
      localStorage.removeItem(key)
    }
  })
  console.log('Cleared all quiz cache')
}