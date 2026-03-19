import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import { PROBLEMS, PROBLEM_ICONS } from '../constants/problems';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Задачи комбинаторной оптимизации
      </Typography>
      <Grid container spacing={3}>
        {PROBLEMS.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.type}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                onClick={() => navigate(`/problem/${p.type}`)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent>
                  <Typography variant="h2" align="center" gutterBottom>
                    {PROBLEM_ICONS[p.type]}
                  </Typography>
                  <Typography variant="h6" align="center">
                    {p.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 1 }}
                  >
                    {p.algorithms.length} алгоритмов
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
