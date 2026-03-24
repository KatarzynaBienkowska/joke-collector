import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { Joke } from './types';
import { useJokeFeed } from './useJokeFeed';

const columns = [
  { field: 'id', headerName: 'ID', width: 10 },
  { field: 'category', headerName: 'Category', width: 150 },
  {
    field: 'joke',
    headerName: 'Joke',
    width: 450,
    renderCell: (params: GridRenderCellParams<Joke>) => {
      const { joke, setup, delivery } = params.row;
      if (joke) return joke;
      if (setup && delivery) return `${setup} ${delivery}`;
      return '';
    },
  },
  {
    field: 'flags',
    headerName: 'Flags',
    width: 500,
    renderCell: (params: GridRenderCellParams<Joke>) => {
      const flags = params.value;
      if (!flags) return '';
      return Object.entries(flags)
        .map(([key, value]) => `${key}: ${value ? '✔️' : '❌'}`)
        .join(', ');
    },
  },
];

const App = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedOn, setFeedOn] = useState<boolean>(false);

  const { lastError, setOnJoke, startFeed, stopFeed } = useJokeFeed(
    'ws://localhost:3000/ws',
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://v2.jokeapi.dev/joke/Any');
      const data = await response.json();
      if (data.error) setError(`${data.message}. ${data.additionalInfo}`);
      else setJokes((prev) => [...prev, data]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOnJoke((joke: Joke) => setJokes((prev) => [...prev, joke]));
  }, [setOnJoke]);

  useEffect(() => {
    if (lastError) setError(lastError);
  }, [lastError]);

  const toggleFeed = () => {
    if (!feedOn) {
      startFeed();
      setFeedOn(true);
    } else {
      stopFeed();
      setFeedOn(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={fetchData}>
            Fetch Joke
          </Button>
          <Button
            variant="contained"
            color={feedOn ? 'warning' : 'primary'}
            onClick={toggleFeed}
          >
            {feedOn ? 'Stop joke feed' : 'Joke feed'}
          </Button>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={jokes}
            columns={columns}
            loading={loading}
            getRowHeight={() => 'auto'}
            sx={{ '& .MuiDataGrid-cell': { padding: '10px' } }}
            localeText={{
              noRowsLabel:
                'No jokes fetched yet. Click the button to fetch a joke.',
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'skeleton',
                noRowsVariant: 'skeleton',
              },
            }}
          />
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  );
};

export default App;
