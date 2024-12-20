import { Button } from '@radix-ui/themes';
import { SupabaseClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import ReactFlow, { Background, BackgroundVariant } from 'reactflow';

interface AuthWrapperProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  supabase: SupabaseClient | null;
  children: React.ReactNode;
}

export const AuthWrapper = ({
  isLoading,
  isAuthenticated,
  supabase,
  children
}: AuthWrapperProps) => {
  const features = [
    {
      title: "AI-Powered Schema Design",
      description: "Simply describe your database needs in plain language, and watch as AI transforms your words into professional database schemas.",
      icon: (
        <svg className="w-12 h-12 text-emerald-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="16" cy="16" r="14" />
          <path d="M16 8v2M8 16H6m20 0h-2m-8 8v2m8-14-1.5 1.5M9.5 22.5 8 24m0-16 1.5 1.5m13 13L24 24" />
          <circle cx="16" cy="16" r="4" />
        </svg>
      )
    },
    {
      title: "Visual Diagram Editor",
      description: "Interact with your database design in real-time. Drag tables, create relationships, and fine-tune your schema with an intuitive interface.",
      icon: (
        <svg className="w-12 h-12 text-emerald-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="24" height="24" rx="2" />
          <path d="M4 12h24M12 4v24M20 4v24" />
          <circle cx="8" cy="8" r="1" />
          <circle cx="16" cy="8" r="1" />
          <circle cx="24" cy="8" r="1" />
        </svg>
      )
    },
    {
      title: "Instant Deployment",
      description: "Turn your design into reality with one click. Export production-ready SQL or deploy directly to Supabase in seconds.",
      icon: (
        <svg className="w-12 h-12 text-emerald-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 4l12 6-12 6-12-6 12-6z" />
          <path d="M4 16l12 6 12-6" />
          <path d="M4 22l12 6 12-6" />
        </svg>
      )
    }
  ];

  const steps = [
    {
      title: "Describe Your Needs",
      description: "Tell us what kind of database you need in plain English. Our AI understands your requirements and converts them into a structured schema."
    },
    {
      title: "Refine Visually",
      description: "Fine-tune your database structure using our interactive diagram editor. Add relationships, modify fields, and perfect your design."
    },
    {
      title: "Deploy Instantly",
      description: "Export your schema as SQL or deploy directly to Supabase with one click. Your database is ready to use in seconds."
    }
  ];

  const renderBackground = useCallback(() => (
    <div className="absolute inset-0 -z-10">
      <ReactFlow nodes={[]} edges={[]}>
        <Background 
          color="#4338ca"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
      </ReactFlow>
    </div>
  ), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-12 h-12 rounded-full border-2 border-indigo-600"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        {renderBackground()}
        
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                  Design Databases with
                  <span className="text-emerald-400 block">AI-Powered Magic</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  Transform your ideas into production-ready database schemas instantly. 
                  No SQL knowledge required - just describe what you need in plain English.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => supabase?.auth.signInWithOAuth({ 
                      provider: 'github',
                      options: { redirectTo: window.location.origin }
                    })}
                    className="relative px-8 py-4 text-lg rounded-lg bg-black/30 backdrop-blur-sm 
                              border border-emerald-500/30 text-emerald-400 group"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 
                                to-green-500/20 blur-xl opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300"
                    />
                    <span className="relative flex items-center gap-3">
                      <svg 
                        className="w-6 h-6" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" 
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                          clipRule="evenodd"
                        />
                      </svg>
                      Start Creating Now
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        →
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right side - Animated illustration */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="aspect-square relative">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 2, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-full h-full bg-black/40 rounded-2xl p-6 backdrop-blur-sm
                             border border-emerald-500/20"
                  >
                    <div className="relative h-full">
                      {/* Table Users */}
                      <motion.div
                        className="absolute top-[20%] left-[25%] w-48 h-auto bg-black/40 rounded-lg border border-emerald-500/30 p-4 backdrop-blur-sm"
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="text-emerald-400 text-sm font-medium mb-2">Users</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                            <div className="h-2 w-24 bg-emerald-500/20 rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                            <div className="h-2 w-20 bg-emerald-500/20 rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                            <div className="h-2 w-16 bg-emerald-500/20 rounded" />
                          </div>
                        </div>
                      </motion.div>

                      {/* Table Posts */}
                      <motion.div
                        className="absolute top-[50%] right-[25%] w-48 h-auto bg-black/40 rounded-lg border border-emerald-500/30 p-4 backdrop-blur-sm"
                        animate={{ y: [5, -5, 5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      >
                        <div className="text-emerald-400 text-sm font-medium mb-2">Posts</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                            <div className="h-2 w-24 bg-emerald-500/20 rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                            <div className="h-2 w-20 bg-emerald-500/20 rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                            <div className="h-2 w-16 bg-emerald-500/20 rounded" />
                          </div>
                        </div>
                      </motion.div>

                      {/* Connexions animées */}
                      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill="rgb(16 185 129 / 0.4)"
                            />
                          </marker>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        <motion.path
                          d="M 120 100 C 180 100, 180 200, 240 200"
                          stroke="rgb(16 185 129 / 0.4)"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="4,4"
                          filter="url(#glow)"
                          animate={{
                            strokeDashoffset: [0, -20]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          markerEnd="url(#arrowhead)"
                        />

                        <circle 
                          cx="120" 
                          cy="100" 
                          r="3" 
                          fill="rgb(16 185 129 / 0.6)"
                        />
                        <circle 
                          cx="240" 
                          cy="200" 
                          r="3" 
                          fill="rgb(16 185 129 / 0.6)"
                        />
                      </svg>

                      {/* Effet de particules amélioré */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 rounded-full"
                          style={{
                            background: `radial-gradient(circle, rgb(16 185 129 / 0.4) 0%, transparent 70%)`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            boxShadow: '0 0 10px rgb(16 185 129 / 0.3)',
                          }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.7, 0.3],
                            y: [0, -20, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Everything You Need to Design Your Database
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                From concept to deployment, we've got you covered with powerful features
                that make database design a breeze.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                >
                  {/* ... Le contenu de vos cartes existantes ... */}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4 relative bg-black/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Three simple steps to go from idea to deployed database
              </p>
            </motion.div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-5xl font-bold text-emerald-400/20 mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Database Design?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join developers who are already using AI to streamline their database design process.
            </p>
            {/* Bouton CTA similaire à celui du hero */}
          </motion.div>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}; 