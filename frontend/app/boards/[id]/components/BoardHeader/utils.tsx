import { Eye, EyeIcon, Users } from 'lucide-react';

export function getVisibilityLabel(visibility?: string): string {
  switch (visibility) {
    case 'PRIVATE':
      return 'Private';
    case 'PUBLIC':
      return 'Public';
    case 'WORKSPACE':
      return 'Workspace';
    default:
      return 'Private';
  }
}

export function getVisibilityIcon(visibility?: string) {
  switch (visibility) {
    case 'PRIVATE':
      return <Eye className='w-4 h-4' />;
    case 'PUBLIC':
      return <EyeIcon className='w-4 h-4' />;
    case 'WORKSPACE':
      return <Users className='w-4 h-4' />;
    default:
      return <Eye className='w-4 h-4' />;
  }
}
