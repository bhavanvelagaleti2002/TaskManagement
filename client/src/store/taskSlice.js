import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/authService';

// Helper function to extract error message
const getErrorMessage = (error) => {
    return error.response?.data?.message ||
           (typeof error.response?.data === 'string' ? error.response.data : null) ||
           error.message ||
           'An error occurred while processing your request';
};

export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/tasks');
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (task, { rejectWithValue }) => {
        try {
            const response = await api.post('/tasks', task);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async (task, { rejectWithValue }) => {
        try {
            const response = await api.put(`/tasks/${task.id}`, task);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (taskId, { rejectWithValue }) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            return taskId;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        items: [],
        status: 'idle',
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateTaskInStore: (state, action) => {
            const { type, payload } = action.payload;
            switch (type) {
                case 'create':
                    state.items.push(payload);
                    break;
                case 'update':
                    const index = state.items.findIndex(task => task.id === payload.id);
                    if (index !== -1) {
                        state.items[index] = payload;
                    }
                    break;
                case 'delete':
                    state.items = state.items.filter(task => task.id !== payload);
                    break;
                default:
                    break;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch tasks
            .addCase(fetchTasks.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch tasks';
            })
            // Create task
            .addCase(createTask.pending, (state) => {
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.error = null;
            })
            .addCase(createTask.rejected, (state, action) => {
                state.error = action.payload || 'Failed to create task';
            })
            // Update task
            .addCase(updateTask.pending, (state) => {
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.items.findIndex(task => task.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.error = action.payload || 'Failed to update task';
            })
            // Delete task
            .addCase(deleteTask.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.items = state.items.filter(task => task.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete task';
            });
    }
});

export const { clearError, updateTaskInStore } = taskSlice.actions;
export default taskSlice.reducer;
