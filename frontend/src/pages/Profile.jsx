import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/authSlice';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      timezone: user?.preferences?.timezone || 'UTC',
      theme: user?.preferences?.theme || 'system',
    }
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(updateProfile({
        name: data.name,
        preferences: {
          ...user?.preferences,
          timezone: data.timezone,
          theme: data.theme,
        }
      })).unwrap();
      toast.success('Profile updated');
    } catch (e) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('name')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="UTC"
              {...register('timezone')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('theme')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Save changes
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            onClick={() => reset()}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;