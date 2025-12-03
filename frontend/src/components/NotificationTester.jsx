import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { apiCall } from '../config/api'
import { useRealtime } from '../contexts/realtime-context'
import { toast } from 'sonner'

const NotificationTester = () => {
  const { connected } = useRealtime()
  const [loading, setLoading] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [notificationType, setNotificationType] = useState('system')

  const testNotification = async (endpoint, data = {}) => {
    try {
      setLoading(true)
      const response = await apiCall(`/test-notifications/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      toast.success(response.message || 'Notification sent!')
    } catch (error) {
      toast.error(error.message || 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const sendCustomNotification = async () => {
    if (!customTitle.trim() || !customMessage.trim()) {
      toast.error('Please enter both title and message')
      return
    }

    await testNotification('real-time', {
      type: notificationType,
      title: customTitle,
      message: customMessage
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Notification System Tester
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm font-normal text-muted-foreground">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </CardTitle>
        <CardDescription>
          Test the real-time notification system with various notification types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Test Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Quick Tests</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => testNotification('create-samples')}
              disabled={loading}
              variant="outline"
            >
              Create Sample Notifications
            </Button>
            <Button
              onClick={() => testNotification('achievement', { achievement: 'Test Master' })}
              disabled={loading}
              variant="outline"
            >
              Test Achievement
            </Button>
            <Button
              onClick={() => testNotification('level-up', { level: 10 })}
              disabled={loading}
              variant="outline"
            >
              Test Level Up
            </Button>
            <Button
              onClick={() => testNotification('streak', { streak: 14 })}
              disabled={loading}
              variant="outline"
            >
              Test Streak (14 days)
            </Button>
          </div>
        </div>

        {/* Custom Notification */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Custom Notification</h3>
          <div className="space-y-3">
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="level_up">Level Up</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="challenge">Challenge</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Notification title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
            
            <Input
              placeholder="Notification message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
            
            <Button
              onClick={sendCustomNotification}
              disabled={loading}
              className="w-full"
            >
              Send Custom Notification
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure you're logged in to receive notifications</li>
            <li>Check the notification bell icon in the top navigation</li>
            <li>Browser notifications will appear if permission is granted</li>
            <li>Real-time notifications appear instantly via WebSocket</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationTester