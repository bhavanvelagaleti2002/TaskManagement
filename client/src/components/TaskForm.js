import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTask } from '../store/taskSlice';
import { Box, TextField, Button, Paper, Typography, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';

const TaskForm = () => {
    const dispatch = useDispatch();
    const [task, setTask] = useState({ title: '', description: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await dispatch(createTask(task)).unwrap();
            setTask({ title: '', description: '' }); // Reset form
        } catch (err) {
            setError(err.message || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Add sx={{ mr: 1 }} />
                Create New Task
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="title"
                    label="Task Title"
                    name="title"
                    value={task.title}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoFocus
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="description"
                    label="Task Description"
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    multiline
                    rows={3}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={isSubmitting || !task.title.trim()}
                    startIcon={<Add />}
                >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
            </Box>
        </Paper>
    );
};

export default TaskForm;
