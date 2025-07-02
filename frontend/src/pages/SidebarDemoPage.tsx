import React, { useState } from 'react';
import { ModernSidebar, SidebarTheme } from '../components/ModernSidebar';
import { Button } from '../components/ui/button';
import { 
  Palette, 
  Moon, 
  Sun, 
  Minimize, 
  Maximize,
  Eye 
} from 'lucide-react';

export default function SidebarDemoPage() {
  const [theme, setTheme] = useState<SidebarTheme>('dark');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);

  const themeOptions: { key: SidebarTheme; label: string; icon: React.ElementType; description: string }[] = [
    {
      key: 'dark',
      label: 'Dark Theme',
      icon: Moon,
      description: 'Elegant dark sidebar with gradient accents'
    },
    {
      key: 'light',
      label: 'Light Theme',
      icon: Sun,
      description: 'Clean light sidebar with modern design'
    },
    {
      key: 'minimal',
      label: 'Minimal Theme',
      icon: Minimize,
      description: 'Ultra-minimal design with subtle accents'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Theme Selector */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Sidebar Themes
          </h3>
          
          <div className="space-y-2">
            {themeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setTheme(option.key)}
                className={`
                  w-full flex items-center p-2 rounded-lg text-left transition-colors
                  ${theme === option.key 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-600'
                  }
                `}
              >
                <option.icon className="w-4 h-4 mr-2" />
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs opacity-70">{option.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Collapsed
              </label>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`
                  flex items-center p-1 rounded transition-colors
                  ${isCollapsed ? 'text-blue-600' : 'text-gray-400'}
                `}
              >
                {isCollapsed ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-2">
            <button
              onClick={() => setShowAllThemes(!showAllThemes)}
              className="w-full flex items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showAllThemes ? 'Show Single' : 'Show All Themes'}
            </button>
          </div>
        </div>
      </div>

      {showAllThemes ? (
        /* Show All Three Themes Side by Side */
        <div className="flex h-screen">
          <div className="flex-1 flex">
            {/* Dark Theme */}
            <div className="w-1/3 border-r-2 border-gray-300">
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium z-10">
                Dark Theme
              </div>
              <ModernSidebar theme="dark" isCollapsed={false} />
            </div>

            {/* Light Theme */}
            <div className="w-1/3 border-r-2 border-gray-300">
              <div className="absolute top-2 left-1/3 ml-2 bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium z-10 shadow">
                Light Theme
              </div>
              <ModernSidebar theme="light" isCollapsed={false} />
            </div>

            {/* Minimal Theme */}
            <div className="w-1/3">
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium z-10">
                Minimal Theme
              </div>
              <ModernSidebar theme="minimal" isCollapsed={false} />
            </div>
          </div>
        </div>
      ) : (
        /* Show Single Selected Theme */
        <div className="flex h-screen">
          <ModernSidebar 
            theme={theme} 
            isCollapsed={isCollapsed} 
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Modern Sidebar Components
                </h1>
                
                <div className="prose prose-gray max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Three beautiful sidebar themes inspired by modern dashboard designs. 
                    Each theme offers a unique aesthetic while maintaining consistent functionality.
                  </p>

                  <div className="grid md:grid-cols-3 gap-6 my-8">
                    {themeOptions.map((option) => (
                      <div key={option.key} className="p-4 border rounded-lg">
                        <div className="flex items-center mb-2">
                          <option.icon className="w-5 h-5 mr-2 text-blue-600" />
                          <h3 className="font-semibold">{option.label}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    ))}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Responsive design with mobile support
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Collapsible sidebar with smooth animations
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Expandable menu items with sub-navigation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Notification badges and user profile section
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Three distinct theme variations
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Active state management and routing integration
                    </li>
                  </ul>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Usage</h3>
                    <p className="text-blue-700 text-sm">
                      Use the theme selector in the top-right corner to switch between different sidebar styles. 
                      Toggle the collapsed state to see how the sidebar adapts to different screen sizes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 