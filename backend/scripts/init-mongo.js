db = db.getSiblingDB('taskmanager');

db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    { role: 'readWrite', db: 'taskmanager' },
    { role: 'dbAdmin', db: 'taskmanager' }
  ]
});

db.projects.insertOne({
  name: 'Welcome Project',
  description: 'Your first project!',
  color: '#3B82F6',
  settings: { isPublic: false, allowComments: true, autoArchive: false },
  stats: { totalTasks: 0, completedTasks: 0, overdueTasks: 0 },
  createdAt: new Date(),
  updatedAt: new Date(),
});


