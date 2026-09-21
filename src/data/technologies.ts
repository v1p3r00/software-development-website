export type GroupKey = 'frontend' | 'backend' | 'database' | 'infrastructure' | 'enterprise';

export interface Tech {
  id: string;
  name: string;
  group: GroupKey;
  /** ids of related technologies */
  links: string[];
}

export const groups: GroupKey[] = ['frontend', 'backend', 'database', 'infrastructure', 'enterprise'];

export const technologies: Tech[] = [
  { id: 'react', name: 'React', group: 'frontend', links: ['typescript', 'rest', 'css', 'html'] },
  { id: 'angular', name: 'Angular', group: 'frontend', links: ['typescript', 'rest', 'clarity', 'websockets'] },
  { id: 'typescript', name: 'TypeScript', group: 'frontend', links: ['react', 'angular', 'rest'] },
  { id: 'html', name: 'HTML', group: 'frontend', links: ['css', 'react'] },
  { id: 'css', name: 'CSS', group: 'frontend', links: ['html', 'react', 'angular'] },

  { id: 'java', name: 'Java', group: 'backend', links: ['spring', 'postgresql', 'automic', 'docker'] },
  { id: 'spring', name: 'Spring Boot', group: 'backend', links: ['java', 'rest', 'postgresql', 'h2'] },
  { id: 'rest', name: 'REST', group: 'backend', links: ['spring', 'react', 'angular', 'typescript'] },
  { id: 'websockets', name: 'WebSockets', group: 'backend', links: ['spring', 'angular'] },

  { id: 'postgresql', name: 'PostgreSQL', group: 'database', links: ['spring', 'java', 'docker'] },
  { id: 'mariadb', name: 'MariaDB', group: 'database', links: ['spring', 'docker'] },
  { id: 'h2', name: 'H2', group: 'database', links: ['spring', 'cicd'] },

  { id: 'docker', name: 'Docker', group: 'infrastructure', links: ['cicd', 'linux', 'postgresql', 'java'] },
  { id: 'git', name: 'Git', group: 'infrastructure', links: ['cicd'] },
  { id: 'cicd', name: 'CI/CD', group: 'infrastructure', links: ['git', 'docker', 'linux', 'h2'] },
  { id: 'linux', name: 'Linux', group: 'infrastructure', links: ['docker', 'cicd'] },

  { id: 'clarity', name: 'Clarity', group: 'enterprise', links: ['angular'] },
  { id: 'automic', name: 'Automic', group: 'enterprise', links: ['java', 'linux'] },
];
