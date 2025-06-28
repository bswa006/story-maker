'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, CreditCard, LogOut, Settings, Loader2 } from 'lucide-react';

export function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push('/auth/signin')}
        >
          Sign In
        </Button>
        <Button
          onClick={() => router.push('/auth/signup')}
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
        >
          Get Started
        </Button>
      </div>
    );
  }

  const getPlanBadge = () => {
    const plan = session.user.subscriptionPlan || 'free';
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-700',
      story_explorer: 'bg-blue-100 text-blue-700',
      family_storyteller: 'bg-purple-100 text-purple-700',
      story_universe: 'bg-gradient-to-r from-violet-100 to-purple-100 text-purple-800'
    };
    
    const labels: Record<string, string> = {
      free: 'Free',
      story_explorer: 'Explorer',
      family_storyteller: 'Family',
      story_universe: 'Universe'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[plan] || colors.free}`}>
        {labels[plan] || 'Free'}
      </span>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white">
            {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium">{session.user.name || 'User'}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              {session.user.email}
              {getPlanBadge()}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-normal text-sm">{session.user.name || 'User'}</span>
            <span className="font-normal text-xs text-gray-500">{session.user.email}</span>
            <div className="mt-1">{getPlanBadge()}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/billing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          Billing & Subscription
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}