import { graphqlRequest } from '../graphql-client';

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  logoUrl?: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE';
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  memberships: WorkspaceMember[];
}

/**
 * Get all workspaces for current user
 */
export async function getMyWorkspaces(): Promise<Workspace[]> {
  const query = `
    query MyWorkspaces {
      myWorkspaces {
        id
        name
        logoUrl
        visibility
        memberCount
        createdAt
        updatedAt
        memberships {
          id
          userId
          role
          joinedAt
        }
      }
    }
  `;

  const result = await graphqlRequest<{ myWorkspaces: Workspace[] }>(query);
  return result.myWorkspaces;
}
