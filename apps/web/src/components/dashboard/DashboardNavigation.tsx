'use client';

/**
 * Premium Dashboard Navigation
 * Apple-Level Minimal Aesthetic
 *
 * Design Principles:
 * - Minimal: Clean, unobtrusive sidebar
 * - Clarity: Clear visual hierarchy
 * - Deference: Content takes precedence
 * - Precision: Pixel-perfect spacing
 */

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CogIcon,
  ArrowPathIcon,
  HeartIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Job Swipe', href: '/jobs', icon: ArrowPathIcon },
  { name: 'Applications', href: '/dashboard/applications', icon: BriefcaseIcon },
  { name: 'Resumes', href: '/dashboard/resumes', icon: DocumentTextIcon },
  { name: 'Saved Jobs', href: '/dashboard/saved', icon: HeartIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

export function DashboardNavigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-modal lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-smooth ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-quick ease-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition duration-smooth ease-out transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition duration-quick ease-out transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-smooth"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-out duration-quick"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-quick active:scale-95"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <SidebarContent navigation={navigation} pathname={pathname} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-sticky lg:flex lg:w-64 lg:flex-col">
        <SidebarContent navigation={navigation} pathname={pathname} />
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-sticky flex items-center gap-x-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3 lg:hidden">
        <button
          type="button"
          className="h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-quick active:scale-95 flex items-center justify-center"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" aria-hidden="true" />
        </button>

        <div className="flex-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 font-semibold text-sm">J</span>
            </div>
            <span className="text-headline font-semibold text-gray-900 dark:text-white">JobSwipe</span>
          </Link>
        </div>
      </div>
    </>
  );
}

interface SidebarContentProps {
  navigation: typeof navigation;
  pathname: string;
}

function SidebarContent({ navigation, pathname }: SidebarContentProps) {
  return (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 px-4 py-6">
      {/* Logo */}
      <div className="flex h-12 shrink-0 items-center px-2">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center shadow-minimal">
            <span className="text-white dark:text-gray-900 font-semibold">J</span>
          </div>
          <span className="text-headline font-semibold text-gray-900 dark:text-white">JobSwipe</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          <li>
            <ul role="list" className="space-y-0.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        // Base styles
                        'group flex items-center gap-x-3',
                        'rounded-lg px-3 py-2.5',
                        'text-subhead font-medium',
                        'transition-all duration-quick ease-out',
                        // Active state (subtle)
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50',
                        // Active state (border accent - minimal)
                        isActive && 'border-l-2 border-primary -ml-px pl-[11px]'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-colors duration-quick',
                          isActive
                            ? 'text-primary'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Spacer */}
          <li className="mt-auto"></li>
        </ul>
      </nav>
    </div>
  );
}
