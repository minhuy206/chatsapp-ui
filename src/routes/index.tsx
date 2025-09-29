import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/Container'
import { ResponsiveWrapper } from '@/components/layout/ResponsiveWrapper'
import { MessageSquare, BarChart3, Crown } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <ResponsiveWrapper fullHeight maxWidth="lg" className="text-center space-y-8 py-8">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="relative">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            ChatApp AI
          </h1>
        </div>

        <Container size="md" className="mx-auto">
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-light mb-8">
            Chat with the world's most advanced AI models. Choose your preferred model and have natural conversations
            with cutting-edge language models in a clean, focused interface.
          </p>
        </Container>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Badge variant="outline" className="px-4 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="mr-2 text-lg">🤖</span>GPT-4
          </Badge>
          <Badge variant="outline" className="px-4 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="mr-2 text-lg">🧠</span>Claude
          </Badge>
          <Badge variant="outline" className="px-4 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="mr-2 text-lg">🔍</span>Gemini
          </Badge>
          <Badge variant="outline" className="px-4 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="mr-2">✨</span>More
          </Badge>
        </div>
      </div>

      {/* CTA Section */}
      <div className="space-y-4 py-8">
        <Link to="/chat">
          <Button size="lg" className="px-8 py-6 text-lg font-semibold">
            <MessageSquare className="h-5 w-5 mr-2" />
            Start Chatting
          </Button>
        </Link>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Join thousands of users having conversations with AI models
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Smart Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Have natural conversations with advanced AI models. Switch between models seamlessly.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Model Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Choose from the latest AI models including GPT-4, Claude, and Gemini with easy switching.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-2">
              <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-lg">Clean Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Enjoy a distraction-free chat experience with a clean, modern interface designed for productivity.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </ResponsiveWrapper>
  )
}