'use client';

import { useSession } from 'next-auth/react';
import { ArrowLeft, Sparkles, BookOpen, Palette, Clock, Shield, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateStoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=/create-story');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-pulse mx-auto"></div>
            <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 mt-4 font-light">Loading your creative space...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Elegant Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <main className="relative container mx-auto px-6 py-12 max-w-7xl">
        {/* Elegant Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI Story Creation Studio
          </div>
          
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Create Your
            <span className="block text-6xl font-normal bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Magical Story
            </span>
          </h1>
          
        </div>

        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Personalized Stories</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every tale is uniquely crafted for your child&apos;s personality
            </p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Palette className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Studio Ghibli Art</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Beautiful hand-crafted style illustrations in every scene
            </p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Instant Creation</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Complete storybook ready in under 2 minutes
            </p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Child-Safe Content</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Age-appropriate stories with educational value
            </p>
          </div>
        </div>

        {/* Main Story Generator Card */}
        <div className="relative">
          {/* Premium Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-3xl blur-xl opacity-20"></div>
          
          {/* Card Content */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Sparkles className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">Story Creation Studio</h2>
                    <p className="text-sm text-gray-600">Let&apos;s create something magical together</p>
                  </div>
                </div>
                
                {/* Trust Badge */}
                <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-gray-700">50,000+ Stories Created</span>
                </div>
              </div>
            </div>

            {/* Get Started Button */}
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Ready to create a personalized storybook? Let&apos;s begin your magical journey.
              </p>
              <Button
                onClick={() => router.push('/create-story/generator')}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3"
              >
                Start Creating Your Story
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Elegant Tips Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-light text-gray-900 mb-8">Tips for Best Results</h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📸</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Use Clear Photos</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Well-lit photos with your child&apos;s face clearly visible work best
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">✨</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Choose Themes Wisely</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select themes that match your child&apos;s interests and age
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Personalize Details</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Add specific interests to make the story truly unique
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="relative mt-20 py-8 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 font-light">
            Creating magical moments, one story at a time • © 2024 StoryMaker AI
          </p>
        </div>
      </footer>

    </div>
  );
}