import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskService from '../services/taskService';

const initialState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  isError: false,
  message: '',
  filters: {
    status: '',
    priority: '',
    project: '',
    tags: [],
    search: '',
  },
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  },
  analytics: null,
};

// Get all tasks
export const getTasks = createAsyncThunk(
  'tasks/getTasks',
  async (params, thunkAPI) => {
    try {
      return await taskService.getTasks(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single task
export const getTask = createAsyncThunk(
  'tasks/getTask',
  async (taskId, thunkAPI) => {
    try {
      return await taskService.getTask(taskId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, thunkAPI) => {
    try {
      return await taskService.createTask(taskData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, thunkAPI) => {
    try {
      return await taskService.updateTask(taskId, taskData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, thunkAPI) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get task analytics
export const getTaskAnalytics = createAsyncThunk(
  'tasks/getAnalytics',
  async (period, thunkAPI) => {
    try {
      return await taskService.getAnalytics(period);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        priority: '',
        project: '',
        tags: [],
        search: '',
      };
    },
    updateTaskInList: (state, action) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    addTaskToList: (state, action) => {
      state.tasks.unshift(action.payload);
      state.pagination.total += 1;
    },
    removeTaskFromList: (state, action) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
      state.pagination.total -= 1;
    },
    reorderTasks: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.tasks.splice(sourceIndex, 1);
      state.tasks.splice(destinationIndex, 0, removed);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload.task;
      })
      .addCase(getTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload.task);
        state.pagination.total += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload.task._id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
        if (state.currentTask && state.currentTask._id === action.payload.task._id) {
          state.currentTask = action.payload.task;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(getTaskAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const {
  reset,
  clearCurrentTask,
  setFilters,
  clearFilters,
  updateTaskInList,
  addTaskToList,
  removeTaskFromList,
  reorderTasks,
} = tasksSlice.actions;

export default tasksSlice.reducer;