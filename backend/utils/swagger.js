const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager Pro API',
      version: '1.0.0',
      description: 'A comprehensive task management API with real-time collaboration features',
      contact: {
        name: 'API Support',
        email: 'support@taskmanager.com',
        url: 'https://taskmanager.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://task-manager-pro-production.up.railway.app/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            avatar: {
              type: 'string',
              example: 'https://example.com/avatar.jpg'
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark', 'system'],
                  example: 'system'
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean', example: true },
                    push: { type: 'boolean', example: true },
                    reminders: { type: 'boolean', example: true }
                  }
                },
                timezone: {
                  type: 'string',
                  example: 'UTC'
                }
              }
            },
            gamification: {
              type: 'object',
              properties: {
                level: { type: 'number', example: 5 },
                xp: { type: 'number', example: 1250 },
                streak: { type: 'number', example: 7 },
                badges: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['first_task', 'streak_master']
                }
              }
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Complete project documentation'
            },
            description: {
              type: 'string',
              example: 'Write comprehensive documentation for the new feature'
            },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'completed', 'cancelled'],
              example: 'in-progress'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T23:59:59Z'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-18T15:30:00Z'
            },
            estimatedTime: {
              type: 'number',
              example: 120
            },
            actualTime: {
              type: 'number',
              example: 135
            },
            project: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            assignedTo: {
              type: 'string',
              example: '507f1f77bcf86cd799439013'
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439014'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['documentation', 'frontend', 'urgent']
            },
            subtasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Research requirements' },
                  completed: { type: 'boolean', example: true },
                  completedAt: { type: 'string', format: 'date-time' },
                  order: { type: 'number', example: 1 }
                }
              }
            },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439015']
            },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { type: 'string', example: '507f1f77bcf86cd799439013' },
                  text: { type: 'string', example: 'Great progress on this task!' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-18T15:30:00Z'
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Website Redesign'
            },
            description: {
              type: 'string',
              example: 'Complete redesign of the company website'
            },
            color: {
              type: 'string',
              example: '#3B82F6'
            },
            icon: {
              type: 'string',
              example: 'folder'
            },
            owner: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            collaborators: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { type: 'string', example: '507f1f77bcf86cd799439013' },
                  role: {
                    type: 'string',
                    enum: ['viewer', 'editor', 'admin'],
                    example: 'editor'
                  },
                  joinedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-10T09:00:00Z'
                  }
                }
              }
            },
            settings: {
              type: 'object',
              properties: {
                isPublic: { type: 'boolean', example: false },
                allowComments: { type: 'boolean', example: true },
                autoArchive: { type: 'boolean', example: false }
              }
            },
            stats: {
              type: 'object',
              properties: {
                totalTasks: { type: 'number', example: 25 },
                completedTasks: { type: 'number', example: 18 },
                overdueTasks: { type: 'number', example: 2 }
              }
            },
            isArchived: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};
