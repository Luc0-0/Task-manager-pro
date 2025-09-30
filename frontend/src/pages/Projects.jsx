import { useEffect, useState } from "react";
import projectService from "../services/projectService";
import toast from "react-hot-toast";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const fetchProjects = async () => {
    try {
      const list = await projectService.getProjects();
      setProjects(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Error fetching projects:", e);
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const proj = await projectService.createProject({ name });
      setProjects((prev) => [proj, ...prev]); // prepend new project
      setIsOpen(false);
      setName("");
      toast.success("Project created");
    } catch (e) {
      console.error("Error creating project:", e);
      toast.error("Failed to create project");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Projects
        </h1>
        <button className="btn-primary" onClick={() => setIsOpen(true)}>
          New Project
        </button>
      </div>

      {/* Project list */}
      {Array.isArray(projects) && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p._id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: p.color || "#3b82f6" }}
                  />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  {p.stats?.totalTasks || 0} tasks
                </span>
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {p.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No projects yet.</p>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create Project
              </h2>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
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

export default Projects;
