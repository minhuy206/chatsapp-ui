import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white rounded-lg shadow-lg">
      <div className="max-w-2xl mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          ChatApp AI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Compare responses from multiple AI models in real-time
        </p>
        <div className="space-y-4">
          <Link
            to="/chat"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Start Chatting
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Chat with GPT-4, Claude, Gemini and more models simultaneously
          </div>
        </div>
      </div>
    </div>
  )
}
