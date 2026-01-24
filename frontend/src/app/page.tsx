import Link from 'next/link';
import { Database, Zap, Shield, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Full-Stack Demo Application
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          A comprehensive demo showcasing modern web development technologies including
          Next.js, Express.js, PostgreSQL, MySQL, Redis, WebSockets, and JWT authentication.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Get Started
          </Link>
          <Link
            href="/posts"
            className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-8 py-3 rounded-lg font-medium transition"
          >
            View Posts
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <FeatureCard
          icon={<Database className="w-12 h-12 text-primary-600" />}
          title="Multi-Database"
          description="PostgreSQL as primary database with MySQL for analytics. Redis for caching and session management."
        />
        <FeatureCard
          icon={<Shield className="w-12 h-12 text-primary-600" />}
          title="Authentication"
          description="JWT-based authentication with Google OAuth2 support. Secure password hashing with bcrypt."
        />
        <FeatureCard
          icon={<Zap className="w-12 h-12 text-primary-600" />}
          title="Real-time"
          description="WebSocket integration with Socket.io for real-time chat and notifications."
        />
        <FeatureCard
          icon={<MessageSquare className="w-12 h-12 text-primary-600" />}
          title="REST API"
          description="Well-structured REST API with validation, error handling, and rate limiting."
        />
      </section>

      {/* Tech Stack Section */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Technology Stack
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Backend
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Node.js with TypeScript</li>
              <li>• Express.js framework</li>
              <li>• PostgreSQL (primary database)</li>
              <li>• MySQL (analytics database)</li>
              <li>• Redis (caching & sessions)</li>
              <li>• Socket.io (WebSockets)</li>
              <li>• JWT & Passport.js (authentication)</li>
              <li>• Jest (testing)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Frontend
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Next.js 14 (SSR/SSG)</li>
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Lucide Icons</li>
              <li>• Socket.io Client</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
