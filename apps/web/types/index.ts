// Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  university?: string;
  country?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  reputation: number;
  isVerified: boolean;
  createdAt: Date;
}

// Post Types
export type PostType = 
  | 'COLLABORATION_REQUEST'
  | 'HELP_REQUEST'
  | 'TESTING_REQUEST'
  | 'ASSIGNMENT_COLLABORATION'
  | 'OPEN_SOURCE_CONTRIBUTION'
  | 'STARTUP_IDEA'
  | 'TECHNICAL_DISCUSSION';

export type ProjectStatus = 
  | 'IDEATION'
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'BETA'
  | 'COMPLETED';

export type PostVisibility = 'PUBLIC' | 'UNIVERSITY' | 'PRIVATE';

export interface Skill {
  id: string;
  name: string;
  category: 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'DOMAIN';
}

export interface Post {
  id: string;
  title: string;
  description: string;
  type: PostType;
  status: ProjectStatus;
  visibility: PostVisibility;
  tags: string[];
  teamSize?: number;
  budget?: number;
  repositoryUrl?: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  requiredSkills: Skill[];
  commentCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Discussion Types
export interface Discussion {
  id: string;
  name: string;
  description?: string;
  members: DiscussionMember[];
  messageCount: number;
  memberCount: number;
}

export interface DiscussionMember {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  role: 'OWNER' | 'MODERATOR' | 'MEMBER';
  joinedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  type: 'TEXT' | 'CODE' | 'ANNOUNCEMENT' | 'SYSTEM';
  codeBlock?: {
    language: string;
    code: string;
    filename?: string;
  };
  reactions: Reaction[];
  createdAt: Date;
  isEdited: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  likeCount: number;
  createdAt: Date;
}

// Notification Types
export type NotificationType =
  | 'COMMENT'
  | 'LIKE'
  | 'COLLABORATION_REQUEST'
  | 'COLLABORATION_ACCEPTED'
  | 'ROOM_MENTION'
  | 'PROJECT_UPDATE'
  | 'SKILL_ENDORSED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}
