import { apiCall } from '../config/api'

export const getRoomProgress = async (roomId) => {
  return await apiCall(`/room-progress/${roomId}`)
}

export const joinRoom = async (roomId) => {
  return await apiCall(`/room-progress/${roomId}/join`, {
    method: 'POST'
  })
}

export const submitExercise = async (roomId, lectureIndex, answer) => {
  return await apiCall(`/room-progress/${roomId}/exercise`, {
    method: 'POST',
    body: JSON.stringify({
      lectureIndex,
      answer
    })
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

export const completeRoom = async (roomId, finalScore, totalXP) => {
  return await apiCall(`/room-progress/${roomId}/complete`, {
    method: 'POST',
    body: JSON.stringify({
      finalScore,
      totalXP
    })
  })
}

export const fixCompletionCounts = async () => {
  return await apiCall('/room-progress/fix-counts', {
    method: 'POST'
  })
}