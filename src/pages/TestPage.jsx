import React, { useState, useEffect } from 'react';
import FooterNav from '../components/Footer';

const TestPage = () => {
  // Tour state: tracks current step and whether to show tour
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  // Check if user has seen tour using localStorage
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setShowTour(true);
      localStorage.setItem('hasSeenTour', 'true');
    }
  }, []);

  // Tour steps configuration
  const tourSteps = [
    {
      target: 'events-link',
      title: 'Discover Events',
      description: 'Find campus events like hackathons and workshops.',
    },
    {
      target: 'projects-link',
      title: 'Collaborate on Projects',
      description: 'Team up with peers to build projects.',
    },
    {
      target: 'resources-link',
      title: 'Access Resources',
      description: 'Download study materials and tutorials.',
    },
    {
      target: 'get-started-btn',
      title: 'Get Started',
      description: 'Sign up to unlock all features.',
    },
  ];

  // Handle tour navigation
  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
      setTourStep(0);
    }
  };

  // Toggle hamburger menu for mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reusable tooltip component
  const TooltipLink = ({ id, label, tooltipText, href }) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    return (
      <div className="relative inline-block">
        <a
          id={id}
          href={href}
          className={`px-3 py-2 text-gray-700 hover:text-indigo-600 ${tourStep && tourSteps[tourStep].target === id ? 'ring-2 ring-indigo-600' : ''}`}
          onClick={() => setIsTooltipVisible(!isTooltipVisible)}
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
        >
          {label}
        </a>
        {isTooltipVisible && (
          <span className="absolute z-20 top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
            {tooltipText}
          </span>
        )}
      </div>
    );
  };

  const TooltipButton = ({ id, label, tooltipText }) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    return (
      <div className="relative inline-block">
        <button
          id={id}
          className={`px-6 py-3 bg-white text-indigo-600 font-semibold rounded-md hover:bg-gray-100 ${tourStep && tourSteps[tourStep].target === id ? 'ring-2 ring-indigo-600' : ''}`}
          onClick={() => setIsTooltipVisible(!isTooltipVisible)}
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
        >
          {label}
        </button>
        {isTooltipVisible && (
          <span className="absolute z-20 top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
            {tooltipText}
          </span>
        )}
      </div>
    );
  };

  const TooltipCard = ({ title, description, tooltipText }) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    return (
      <div
        className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        onClick={() => setIsTooltipVisible(!isTooltipVisible)}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
      >
        <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
        <p className="mt-2 text-gray-600">{description}</p>
        {isTooltipVisible && (
          <span className="absolute z-20 top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
            {tooltipText}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600">CampusConnect</h1>
            </div>
            <div className="hidden sm:flex space-x-4">
              <TooltipLink id="events-link" href="/events" label="Events" tooltipText="Discover campus events" />
              <TooltipLink id="projects-link" href="/projects" label="Projects" tooltipText="Collaborate on projects" />
              <TooltipLink id="resources-link" href="/resources" label="Resources" tooltipText="Access study materials" />
              <a href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Login
              </a>
            </div>
            {/* Hamburger Menu for Mobile */}
            <button
              className="sm:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="sm:hidden flex flex-col space-y-2 pb-4">
              <TooltipLink id="events-link" href="/events" label="Events" tooltipText="Discover campus events" />
              <TooltipLink id="projects-link" href="/projects" label="Projects" tooltipText="Collaborate on projects" />
              <TooltipLink id="resources-link" href="/resources" label="Resources" tooltipText="Access study materials" />
              <a href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Login
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold sm:text-5xl">
            Connect, Collaborate, Succeed
          </h2>
          <p className="mt-4 text-lg">
            Join CampusConnect to discover events, collaborate on projects, and access resources.
          </p>
          <TooltipButton id="get-started-btn" label="Get Started" tooltipText="Sign up to explore all features" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why CampusConnect?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <TooltipCard
              title="Event Discovery"
              description="Find and join campus events like hackathons and workshops."
              tooltipText="Browse events by category"
            />
            <TooltipCard
              title="Project Collaboration"
              description="Team up with peers to build projects and contribute to open source."
              tooltipText="Create or join project teams"
            />
            <TooltipCard
              title="Resource Sharing"
              description="Access study materials, question papers, and tutorials."
              tooltipText="Download or upload resources"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
    <FooterNav />

      {/* Tour Overlay */}
      {showTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900">{tourSteps[tourStep].title}</h3>
            <p className="mt-2 text-gray-600">{tourSteps[tourStep].description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {tourStep + 1} of {tourSteps.length}
              </span>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={nextTourStep}
              >
                {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;