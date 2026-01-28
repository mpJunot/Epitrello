import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MembersSidebarProps {
  memberCount: number;
  guestsCount: number;
  requestsCount: number;
  isAdmin?: boolean;
}

export function MembersSidebar({
  memberCount,
  guestsCount,
  requestsCount,
  isAdmin = false,
}: MembersSidebarProps) {
  return (
    <div className='w-64 flex flex-col shrink-0'>
      <div className='p-4'>
        <TabsList className='flex flex-col h-auto w-full p-1 bg-transparent'>
          <TabsTrigger
            value='members'
            className='w-full justify-between data-[state=active]:bg-trello-blue data-[state=active]:text-white'
          >
            <span>Workspace members</span>
            <span className='px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground data-[state=active]:bg-white/20 data-[state=active]:text-white'>
              {memberCount}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='guests'
            className='w-full justify-between data-[state=active]:bg-trello-blue data-[state=active]:text-white'
          >
            <span>Guests</span>
            <span className='px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground data-[state=active]:bg-white/20 data-[state=active]:text-white'>
              {guestsCount}
            </span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value='requests'
              className='w-full justify-between data-[state=active]:bg-trello-blue data-[state=active]:text-white'
            >
              <span>Join requests</span>
              <span className='px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground data-[state=active]:bg-white/20 data-[state=active]:text-white'>
                {requestsCount}
              </span>
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </div>
  );
}
