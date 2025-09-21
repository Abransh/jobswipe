'use client';

// import { useAuth } from '@/hooks/useAuth'; // Temporarily disabled
import { 
  BriefcaseIcon,
  DocumentTextIcon,
  HeartIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Applications Sent',
    value: '24',
    change: '+4',
    changeType: 'increase',
    icon: BriefcaseIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Interviews Scheduled',
    value: '3',
    change: '+1',
    changeType: 'increase',
    icon: ClockIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Saved Jobs',
    value: '12',
    change: '+2',
    changeType: 'increase',
    icon: HeartIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    name: 'Response Rate',
    value: '12.5%',
    change: '+2.1%',
    changeType: 'increase',
    icon: ChartBarIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const recentApplications = [
  {
    id: 1,
    company: 'Acme Corp',
    position: 'Senior Frontend Developer',
    status: 'pending',
    appliedAt: '2 hours ago',
    location: 'San Francisco, CA',
  },
  {
    id: 2,
    company: 'TechFlow',
    position: 'Full Stack Engineer',
    status: 'interview',
    appliedAt: '1 day ago',
    location: 'Remote',
  },
  {
    id: 3,
    company: 'DataViz Inc',
    position: 'React Developer',
    status: 'rejected',
    appliedAt: '3 days ago',
    location: 'New York, NY',
  },
  {
    id: 4,
    company: 'StartupXYZ',
    position: 'Software Engineer',
    status: 'pending',
    appliedAt: '5 days ago',
    location: 'Austin, TX',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    case 'interview':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'interview':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function DashboardOverview() {
  // Temporarily bypass auth to fix loading issue
  // TODO: Fix auth service and re-enable user data
  // const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back!
        </h2>
        <p className="text-blue-100">
          You've made great progress on your job search. Keep up the momentum!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Applications
          </h3>
          <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {recentApplications.map((application) => (
                <li key={application.id} className="py-5">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {application.position}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.company} • {application.location}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}>
                            {application.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {application.appliedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <a
              href="/dashboard/applications"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View all applications
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  Create Resume
                </h3>
                <p className="text-sm text-gray-500">
                  Build a new resume or update existing ones
                </p>
              </div>
            </div>
            <div className="mt-3">
              <a
                href="/dashboard/resumes"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Get started →
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  Find Jobs
                </h3>
                <p className="text-sm text-gray-500">
                  Swipe through personalized job recommendations
                </p>
              </div>
            </div>
            <div className="mt-3">
              <a
                href="/dashboard/swipe"
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                Start swiping →
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  View Analytics
                </h3>
                <p className="text-sm text-gray-500">
                  Track your job search performance
                </p>
              </div>
            </div>
            <div className="mt-3">
              <a
                href="/dashboard/analytics"
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                View insights →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}