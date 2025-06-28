'use client';

import { useState } from 'react';
import { STORY_TEMPLATES } from '@/data/story-templates';
import { 
  School, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Download,
  Award,
  Calendar,
  Target,
  Heart,
  Brain,
  Smile,
  Plus
} from 'lucide-react';

interface ClassroomProfile {
  id: string;
  name: string;
  teacher: string;
  grade: string;
  studentCount: number;
  ageRange: string;
  focusAreas: string[];
  storiesGenerated: number;
  lastActivity: string;
}

interface EducationalMetrics {
  totalStudents: number;
  totalClassrooms: number;
  storiesGenerated: number;
  engagementRate: number;
  learningOutcomes: {
    socialEmotional: number;
    academicSkills: number;
    behavioralImprovement: number;
  };
  popularCategories: Array<{
    category: string;
    usage: number;
    effectiveness: number;
  }>;
}

interface B2BDashboardProps {
  institutionName: string;
  institutionType: 'school' | 'daycare' | 'therapy_center' | 'library';
  metrics: EducationalMetrics;
  classrooms: ClassroomProfile[];
  onCreateClassroom: () => void;
  onGenerateReport: () => void;
}

export function EducationalDashboard({ 
  institutionName, 
  institutionType, 
  metrics, 
  classrooms,
  onCreateClassroom,
  onGenerateReport 
}: B2BDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'classrooms' | 'content' | 'analytics'>('overview');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const getInstitutionIcon = () => {
    switch (institutionType) {
      case 'school': return <School className="w-6 h-6" />;
      case 'daycare': return <Heart className="w-6 h-6" />;
      case 'therapy_center': return <Brain className="w-6 h-6" />;
      case 'library': return <BookOpen className="w-6 h-6" />;
      default: return <School className="w-6 h-6" />;
    }
  };

  const getInstitutionName = () => {
    switch (institutionType) {
      case 'school': return 'School';
      case 'daycare': return 'Daycare Center';
      case 'therapy_center': return 'Therapy Center';
      case 'library': return 'Library';
      default: return 'Educational Institution';
    }
  };

  const therapeuticTemplates = STORY_TEMPLATES.filter(t => t.therapeuticValue && t.therapeuticValue.length > 0);
  const stemTemplates = STORY_TEMPLATES.filter(t => t.category === 'stem_education');
  const selTemplates = STORY_TEMPLATES.filter(t => t.category === 'emotional_intelligence');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                {getInstitutionIcon()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{institutionName}</h1>
                <p className="text-gray-600">{getInstitutionName()} Educational Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onGenerateReport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={onCreateClassroom}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Classroom
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.totalStudents}</div>
          <div className="text-sm text-gray-500">Active Students</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.totalClassrooms}</div>
          <div className="text-sm text-gray-500">Classrooms</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.storiesGenerated}</div>
          <div className="text-sm text-gray-500">Stories Created</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Smile className="w-6 h-6 text-amber-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.engagementRate}%</div>
          <div className="text-sm text-gray-500">Engagement Rate</div>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Outcomes Impact</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.learningOutcomes.socialEmotional}%</div>
            <div className="text-sm text-gray-600">Social-Emotional Growth</div>
            <div className="text-xs text-gray-500 mt-1">Improved empathy & communication</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.learningOutcomes.academicSkills}%</div>
            <div className="text-sm text-gray-600">Academic Skills</div>
            <div className="text-xs text-gray-500 mt-1">Reading & comprehension gains</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.learningOutcomes.behavioralImprovement}%</div>
            <div className="text-sm text-gray-600">Behavioral Improvement</div>
            <div className="text-xs text-gray-500 mt-1">Reduced disruptions & better focus</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'classrooms', label: 'Classrooms', icon: School },
              { id: 'content', label: 'Content Library', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'classrooms' | 'content' | 'analytics')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Classroom Activity</h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {classrooms.slice(0, 5).map((classroom) => (
                    <div key={classroom.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <School className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{classroom.name}</div>
                          <div className="text-sm text-gray-600">{classroom.teacher} • {classroom.studentCount} students</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{classroom.storiesGenerated} stories</div>
                        <div className="text-xs text-gray-500">{classroom.lastActivity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Popular Content Categories */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Effective Content</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {metrics.popularCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{category.category}</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{category.usage}%</div>
                  <div className="text-sm text-gray-600 mb-3">Usage Rate</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${category.effectiveness}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{category.effectiveness}% effectiveness</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'classrooms' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Classrooms ({classrooms.length})</h2>
            <div className="flex items-center gap-3">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Grades</option>
                <option value="K">Kindergarten</option>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
              <button
                onClick={onCreateClassroom}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Classroom
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms
              .filter(classroom => selectedGrade === 'all' || classroom.grade === selectedGrade)
              .map((classroom) => (
                <div key={classroom.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <School className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      Grade {classroom.grade}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{classroom.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">Teacher: {classroom.teacher}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{classroom.studentCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Age Range:</span>
                      <span className="font-medium">{classroom.ageRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stories Created:</span>
                      <span className="font-medium">{classroom.storiesGenerated}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Focus Areas:</div>
                    <div className="flex flex-wrap gap-1">
                      {classroom.focusAreas.map((area, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                      Create Story
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Educational Content Library</h2>
            <p className="text-gray-600">Curated story templates designed for educational environments</p>
          </div>

          <div className="space-y-8">
            {/* Therapeutic Content */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Therapeutic & SEL Content</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {therapeuticTemplates.slice(0, 6).map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-medium text-gray-900">{template.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description.substring(0, 100)}...</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.therapeuticValue?.slice(0, 2).map((value, index) => (
                        <span key={index} className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full">
                          {value.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <button className="w-full bg-pink-50 text-pink-700 py-2 rounded-lg text-sm hover:bg-pink-100 transition-colors">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* STEM Content */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">STEM Education</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stemTemplates.map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">{template.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description.substring(0, 100)}...</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.themes.slice(0, 2).map((theme, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {theme.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <button className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Social-Emotional Learning */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Social-Emotional Learning</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selTemplates.map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Smile className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-900">{template.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{template.description.substring(0, 100)}...</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.themes.slice(0, 2).map((theme, index) => (
                        <span key={index} className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                          {theme.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <button className="w-full bg-amber-50 text-amber-700 py-2 rounded-lg text-sm hover:bg-amber-100 transition-colors">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Analytics & Insights</h2>
            
            {/* Engagement Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">87%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">4.2</div>
                <div className="text-sm text-gray-600">Avg Stories/Student</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">12 min</div>
                <div className="text-sm text-gray-600">Avg Session Time</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">94%</div>
                <div className="text-sm text-gray-600">Teacher Satisfaction</div>
              </div>
            </div>

            {/* Monthly Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress Report</h3>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Detailed analytics charts would be displayed here</p>
                <p className="text-sm">Integration with analytics service required</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}