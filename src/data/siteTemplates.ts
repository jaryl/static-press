import type { CollectionSchema } from '@/types';

export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  schema: CollectionSchema[];
}

/**
 * Templates for creating new sites
 */
export const siteTemplates: SiteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Site',
    description: 'Start with a completely blank site with no collections.',
    schema: []
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'A basic blog with posts and categories.',
    schema: [
      {
        slug: 'posts',
        name: 'Posts',
        description: 'Blog posts with title, content, and publication date.',
        icon: 'FileText',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
            label: 'Title',
            placeholder: 'Enter post title',
            description: 'The title of the blog post',
          },
          {
            name: 'content',
            type: 'text',
            required: true,
            label: 'Content',
            placeholder: 'Write your post content here',
            description: 'The main body content of the post',
          },
          {
            name: 'excerpt',
            type: 'text',
            required: false,
            label: 'Excerpt',
            placeholder: 'Brief summary of the post',
            description: 'A short excerpt or summary of the post for previews',
          },
          {
            name: 'publishDate',
            type: 'date',
            required: true,
            label: 'Publish Date',
            description: 'When to publish this post',
          },
          {
            name: 'featured',
            type: 'boolean',
            required: false,
            label: 'Featured',
            description: 'Mark this post as featured',
          },
          {
            name: 'category',
            type: 'select',
            required: false,
            label: 'Category',
            description: 'The category this post belongs to',
            options: [
              { label: 'News', value: 'news' },
              { label: 'Tutorial', value: 'tutorial' },
              { label: 'Opinion', value: 'opinion' },
            ],
          },
          {
            name: 'tags',
            type: 'text',
            required: false,
            label: 'Tags',
            description: 'Tags to categorize this post (comma-separated)',
          },
          {
            name: 'coverImage',
            type: 'image',
            required: false,
            label: 'Cover Image',
            description: 'Featured image for the post',
          }
        ],
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        slug: 'authors',
        name: 'Authors',
        description: 'Blog authors with name, bio, and profile image.',
        icon: 'Users',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Name',
            placeholder: 'Author name',
            description: 'The author\'s full name',
          },
          {
            name: 'bio',
            type: 'text',
            required: false,
            label: 'Bio',
            placeholder: 'About the author',
            description: 'Author biography or description',
          },
          {
            name: 'profileImage',
            type: 'image',
            required: false,
            label: 'Profile Image',
            description: 'Author profile picture',
          },
          {
            name: 'email',
            type: 'email',
            required: false,
            label: 'Email',
            placeholder: 'author@example.com',
            description: 'Contact email address',
          },
          {
            name: 'socialLinks',
            type: 'array',
            required: false,
            label: 'Social Links',
            description: 'Social media profiles',
            arrayFields: [
              {
                name: 'platform',
                type: 'select',
                required: true,
                label: 'Platform',
                options: [
                  { label: 'Twitter', value: 'twitter' },
                  { label: 'LinkedIn', value: 'linkedin' },
                  { label: 'GitHub', value: 'github' },
                  { label: 'Instagram', value: 'instagram' },
                ],
              },
              {
                name: 'url',
                type: 'text',
                required: true,
                label: 'URL',
                placeholder: 'https://',
              }
            ]
          }
        ],
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'A personal portfolio site with projects and skills.',
    schema: [
      {
        slug: 'projects',
        name: 'Projects',
        description: 'Portfolio projects with title, description, and images.',
        icon: 'Briefcase',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
            label: 'Project Title',
            placeholder: 'Enter project title',
            description: 'The name of the project',
          },
          {
            name: 'description',
            type: 'text',
            required: true,
            label: 'Description',
            placeholder: 'Describe your project',
            description: 'Detailed description of the project',
          },
          {
            name: 'technologies',
            type: 'text',
            required: false,
            label: 'Technologies',
            description: 'Technologies used in this project (comma-separated)',
          },
          {
            name: 'projectUrl',
            type: 'text',
            required: false,
            label: 'Project URL',
            placeholder: 'https://',
            description: 'Link to the live project',
          },
          {
            name: 'repoUrl',
            type: 'text',
            required: false,
            label: 'Repository URL',
            placeholder: 'https://github.com/',
            description: 'Link to the project repository',
          },
          {
            name: 'images',
            type: 'array',
            required: false,
            label: 'Project Images',
            description: 'Images showcasing the project',
            arrayFields: [
              {
                name: 'image',
                type: 'image',
                required: true,
                label: 'Image',
              },
              {
                name: 'caption',
                type: 'text',
                required: false,
                label: 'Caption',
                placeholder: 'Image description',
              }
            ]
          },
          {
            name: 'featured',
            type: 'boolean',
            required: false,
            label: 'Featured',
            description: 'Mark this project as featured',
          }
        ],
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        slug: 'skills',
        name: 'Skills',
        description: 'Skills and expertise with categories and proficiency levels.',
        icon: 'Award',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Skill Name',
            placeholder: 'Enter skill name',
            description: 'Name of the skill or technology',
          },
          {
            name: 'category',
            type: 'select',
            required: true,
            label: 'Category',
            description: 'Category this skill belongs to',
            options: [
              { label: 'Programming Languages', value: 'languages' },
              { label: 'Frameworks & Libraries', value: 'frameworks' },
              { label: 'Tools & Software', value: 'tools' },
              { label: 'Soft Skills', value: 'soft-skills' },
            ],
          },
          {
            name: 'proficiency',
            type: 'select',
            required: true,
            label: 'Proficiency Level',
            description: 'Your proficiency level with this skill',
            options: [
              { label: 'Beginner', value: 'beginner' },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced', value: 'advanced' },
              { label: 'Expert', value: 'expert' },
            ],
          },
          {
            name: 'yearsExperience',
            type: 'number',
            required: false,
            label: 'Years of Experience',
            description: 'How many years of experience with this skill',
          },
          {
            name: 'icon',
            type: 'text',
            required: false,
            label: 'Icon',
            description: 'Optional icon name for this skill',
          }
        ],
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
];

/**
 * Get a site template by ID
 * @param templateId ID of the template to retrieve
 * @returns The template object or undefined if not found
 */
export function getSiteTemplate(templateId: string): SiteTemplate | undefined {
  return siteTemplates.find(template => template.id === templateId);
}
