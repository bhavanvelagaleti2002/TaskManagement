import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks, updateTask } from '../store/taskSlice';
import { Box, Card, CardContent, Typography, Grid, Chip, IconButton, Alert, CircularProgress } from '@mui/material';
import { Check, Assignment } from '@mui/icons-material';

const TaskList = () => {
    const dispatch = useDispatch();
    const tasks = useSelector(state => state.tasks.items);
    const status = useSelector(state => state.tasks.status);
    const error = useSelector(state => state.tasks.error);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchTasks());
        }
    }, [status, dispatch]);

    const handleStatusChange = (task) => {
        dispatch(updateTask({
            ...task,
            status: task.status === 'Pending' ? 'Completed' : 'Pending'
        }));
    };

    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                Tasks
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {status === 'succeeded' && tasks.length === 0 && (
                <Alert severity="info">
                    No tasks available. Create a new task to get started.
                </Alert>
            )}

            <Grid container spacing={2}>
                {Array.isArray(tasks) && tasks.map(task => (
                    <Grid item xs={12} sm={6} md={4} key={task.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" component="div">
                                        {task.title}
                                    </Typography>
                                    <IconButton 
                                        onClick={() => handleStatusChange(task)}
                                        color={task.status === 'Completed' ? 'success' : 'default'}
                                        aria-label={`Mark task ${task.status === 'Completed' ? 'pending' : 'completed'}`}
                                    >
                                        <Check />
                                    </IconButton>
                                </Box>
                                <Typography color="textSecondary" gutterBottom>
                                    {task.description || 'No description provided'}
                                </Typography>
                                <Box mt={2}>
                                    <Chip 
                                        label={task.status}
                                        color={task.status === 'Completed' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default TaskList;
