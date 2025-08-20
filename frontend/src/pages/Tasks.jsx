import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTasks, createTask } from '../store/tasksSlice';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    project: '',
    dueDate: '',
  });
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const list = await projectService.getProjects();
        setProjects(list);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, project: prev.project || list[0]._id }));
        }
      } catch (e) {
        // ignore for now
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks found. Create your first task!</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Task</h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (!form.project) {
                    toast.error('Please provide a project id');
                    return;
                  }
                  const payload = {
                    title: form.title,
                    description: form.description || undefined,
                    priority: form.priority,
                    project: form.project,
                    dueDate: form.dueDate || undefined,
                  };
                  await dispatch(createTask(payload)).unwrap();
                  setIsModalOpen(false);
                  setForm({ title: '', description: '', priority: 'medium', project: '', dueDate: '' });
                  toast.success('Task created');
                  dispatch(getTasks());
                } catch (err) {
                  toast.error('Failed to create task');
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due date</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
                {projects.length > 0 ? (
                  <div className="flex gap-2">
                    <select
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.project}
                      onChange={(e) => setForm({ ...form, project: e.target.value })}
                      disabled={isLoadingProjects}
                      required
                    >
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={async () => {
                        const name = window.prompt('Project name');
                        if (!name) return;
                        try {
                          const proj = await projectService.createProject({ name });
                          const updated = [proj, ...projects];
                          setProjects(updated);
                          setForm((prev) => ({ ...prev, project: proj._id }));
                          toast.success('Project created');
                        } catch (e) {
                          toast.error('Failed to create project');
                        }
                      }}
                    >
                      New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      onClick={async () => {
                        const name = window.prompt('Create your first project. Name:');
                        if (!name) return;
                        try {
                          const proj = await projectService.createProject({ name });
                          setProjects([proj]);
                          setForm((prev) => ({ ...prev, project: proj._id }));
                          toast.success('Project created');
                        } catch (e) {
                          toast.error('Failed to create project');
                        }
                      }}
                    >
                      + Create Project
                    </button>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">Tasks must belong to a project.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;