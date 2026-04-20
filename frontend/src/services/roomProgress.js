import { apiCall } from '../config/api'

export const getRoomProgress = async (roomId) => {
  return await apiCall(`/room-progress/${roomId}`)
}

export const joinRoom = async (roomId) => {
  return await apiCall(`/room-progress/${roomId}/join`, {
    method: 'POST'
  })
}

export const submitExercise = async (roomId, lectureIndex, answer, points = 100) => {
  return await apiCall(`/room-progress/${roomId}/exercise`, {
    method: 'POST',
    body: JSON.stringify({
      lectureIndex,
      answer,
      points
    })
  })
}

export const submitTaskQuestion = async (roomId, topicId, questionId, answer) => {
  return await apiCall(`/room-progress/${roomId}/task-question`, {
    method: 'POST',
    body: JSON.stringify({ topicId, questionId, answer })
  })
}

export const submitQuiz = async (roomId, quizId, answers) => {
  return await apiCall(`/rooms/${roomId}/quizzes/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      answers
    })
  })
}

export const completeRoom = async (roomId, finalScore, totalXP, totalTasks, category, noHintsUsed = false, perfectScore = false) => {
  return await apiCall(`/room-progress/${roomId}/complete`, {
    method: 'POST',
    body: JSON.stringify({
      finalScore,
      totalXP,
      tasksCompleted: totalTasks,
      totalTasks,
      category,
      noHintsUsed,
      perfectScore
    })
  })
}

export const fixCompletionCounts = async () => {
  return await apiCall('/room-progress/fix-counts', {
    method: 'POST'
  })
}

export const resetRoomProgress = async (roomId) => {
  return await apiCall(`/room-progress/${roomId}/reset`, {
    method: 'POST'
  })
}

// Alias used by the Replay system (same endpoint, clearer name)
export const replayRoom = resetRoomProgress